package evidence

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"strings"
)

const (
	defaultMaxImageBytes     int64 = 500_000_000_000 // 500 GB
	defaultMaxBatchBytes     int64 = 700_000_000     // 700 MB
	defaultMaxBatchFiles           = 100
	defaultMaxArchiveEntries       = 10_000
	defaultMaxExpandedBytes  int64 = 2_000_000_000 // 2 GB
)

// EvidenceFormat is a declared, hinted, or detected format.
type EvidenceFormat string

const (
	FormatAuto   EvidenceFormat = "auto"
	FormatE01    EvidenceFormat = "e01"
	FormatEx01   EvidenceFormat = "ex01"
	FormatRAW    EvidenceFormat = "raw"
	FormatDD     EvidenceFormat = "dd"
	FormatIMG    EvidenceFormat = "img"
	FormatZIP    EvidenceFormat = "zip"
	FormatFile   EvidenceFormat = "file"
	FormatFolder EvidenceFormat = "folder"

	FormatEWF     EvidenceFormat = "ewf"
	FormatPDF     EvidenceFormat = "pdf"
	FormatPNG     EvidenceFormat = "png"
	FormatJPEG    EvidenceFormat = "jpeg"
	FormatGIF     EvidenceFormat = "gif"
	FormatSQLite  EvidenceFormat = "sqlite"
	FormatELF     EvidenceFormat = "elf"
	FormatPE      EvidenceFormat = "pe"
	FormatGZIP    EvidenceFormat = "gzip"
	FormatUnknown EvidenceFormat = "unknown"
)

type InputType string

const (
	InputFile      InputType = "file"
	InputDirectory InputType = "directory"
)

// ValidationOptions controls validation limits and the user's format selection.
type ValidationOptions struct {
	Format EvidenceFormat

	MaxImageBytes           int64
	MaxBatchBytes           int64
	MaxBatchFiles           int
	MaxArchiveEntries       int
	MaxArchiveExpandedBytes int64
}

// FileValidationResult contains findings for one file.
type FileValidationResult struct {
	Name           string
	Path           string
	FormatDeclared EvidenceFormat
	FormatHint     EvidenceFormat
	FormatDetected EvidenceFormat
	Size           int64
	Valid          bool
	Notes          []string
	Error          string
}

// ValidationResult contains findings for the complete input.
type ValidationResult struct {
	Path        string
	Name        string
	InputType   InputType
	IsDirectory bool
	FileCount   int
	TotalSize   int64
	Valid       bool
	Files       []FileValidationResult
	Errors      []string
}

// ValidateEvidence validates a single evidence file or a directory of files.
// It does not modify the original evidence.
//
// A non-nil result may be returned alongside an error so callers can inspect
// per-file findings when a directory contains invalid files.
func ValidateEvidence(
	inputPath string,
	options ValidationOptions,
) (*ValidationResult, error) {
	inputPath = strings.TrimSpace(inputPath)
	if inputPath == "" {
		return nil, fmt.Errorf("evidence path cannot be empty")
	}

	options.Format = EvidenceFormat(strings.ToLower(strings.TrimSpace(string(options.Format))))
	if options.Format == "" {
		options.Format = FormatAuto
	}

	switch options.Format {
	case FormatAuto, FormatE01, FormatEx01, FormatRAW, FormatDD,
		FormatIMG, FormatZIP, FormatFile, FormatFolder:
	default:
		return nil, fmt.Errorf("unsupported declared format %q", options.Format)
	}

	if options.MaxImageBytes <= 0 {
		options.MaxImageBytes = defaultMaxImageBytes
	}
	if options.MaxBatchBytes <= 0 {
		options.MaxBatchBytes = defaultMaxBatchBytes
	}
	if options.MaxBatchFiles <= 0 {
		options.MaxBatchFiles = defaultMaxBatchFiles
	}
	if options.MaxArchiveEntries <= 0 {
		options.MaxArchiveEntries = defaultMaxArchiveEntries
	}
	if options.MaxArchiveExpandedBytes <= 0 {
		options.MaxArchiveExpandedBytes = defaultMaxExpandedBytes
	}

	info, err := os.Lstat(inputPath)
	if err != nil {
		return nil, fmt.Errorf("cannot access evidence path: %w", err)
	}

	// Do not follow a symlink as the evidence input.
	if info.Mode()&os.ModeSymlink != 0 {
		return nil, fmt.Errorf("symbolic links are not accepted as evidence inputs")
	}

	result := &ValidationResult{
		Path:        inputPath,
		Name:        filepath.Base(filepath.Clean(inputPath)),
		IsDirectory: info.IsDir(),
		Valid:       false,
	}

	if info.IsDir() {
		result.InputType = InputDirectory

		if options.Format != FormatAuto && options.Format != FormatFolder {
			return result, fmt.Errorf(
				"directory input requires format auto or folder, not %q",
				options.Format,
			)
		}

		walkErr := filepath.WalkDir(inputPath, func(
			currentPath string,
			entry os.DirEntry,
			walkErr error,
		) error {
			if walkErr != nil {
				result.Errors = append(result.Errors,
					fmt.Sprintf("%s: %v", currentPath, walkErr))
				return nil
			}

			if currentPath == inputPath {
				return nil
			}

			if entry.Type()&os.ModeSymlink != 0 {
				result.Errors = append(result.Errors,
					fmt.Sprintf("%s: symbolic links are not allowed", currentPath))
				return nil
			}

			if entry.IsDir() {
				return nil
			}

			if !entry.Type().IsRegular() {
				result.Errors = append(result.Errors,
					fmt.Sprintf("%s: unsupported filesystem entry", currentPath))
				return nil
			}

			result.FileCount++
			if result.FileCount > options.MaxBatchFiles {
				result.Errors = append(result.Errors,
					fmt.Sprintf("directory exceeds the limit of %d files",
						options.MaxBatchFiles))
				return filepath.SkipAll
			}

			// Files inside a directory are treated as a batch.
			fileResult, fileErr := validateEvidenceFile(
				currentPath,
				FormatAuto,
				true,
				options,
			)

			result.Files = append(result.Files, fileResult)
			result.TotalSize += fileResult.Size

			if fileErr != nil {
				result.Errors = append(result.Errors,
					fmt.Sprintf("%s: %v", currentPath, fileErr))
			}

			if result.TotalSize > options.MaxBatchBytes {
				result.Errors = append(result.Errors,
					fmt.Sprintf("directory exceeds the total size limit of %d bytes",
						options.MaxBatchBytes))
				return filepath.SkipAll
			}

			return nil
		})

		if walkErr != nil {
			result.Errors = append(result.Errors,
				fmt.Sprintf("directory traversal failed: %v", walkErr))
		}

		if result.FileCount == 0 && len(result.Errors) == 0 {
			result.Errors = append(result.Errors,
				"directory contains no regular files")
		}
	} else {
		if options.Format == FormatFolder {
			return result, fmt.Errorf("folder format requires a directory")
		}

		if !info.Mode().IsRegular() {
			return result, fmt.Errorf("input must be a regular file or directory")
		}

		result.InputType = InputFile
		result.FileCount = 1

		fileResult, fileErr := validateEvidenceFile(
			inputPath,
			options.Format,
			false,
			options,
		)

		result.Files = append(result.Files, fileResult)
		result.TotalSize = fileResult.Size

		if fileErr != nil {
			result.Errors = append(result.Errors, fileErr.Error())
		}
	}

	result.Valid = len(result.Errors) == 0

	if !result.Valid {
		return result, fmt.Errorf(
			"evidence validation failed: %s",
			strings.Join(result.Errors, "; "),
		)
	}

	return result, nil
}

// validateEvidenceFile validates a regular file without modifying it.
func validateEvidenceFile(
	filePath string,
	declaredFormat EvidenceFormat,
	isBatch bool,
	options ValidationOptions,
) (FileValidationResult, error) {
	result := FileValidationResult{
		Path:           filePath,
		Name:           filepath.Base(filePath),
		FormatDeclared: declaredFormat,
		FormatHint:     formatFromExtension(filePath),
		FormatDetected: FormatUnknown,
	}

	info, err := os.Lstat(filePath)
	if err != nil {
		return result, fmt.Errorf("cannot inspect file: %w", err)
	}

	if info.Mode()&os.ModeSymlink != 0 {
		return result, fmt.Errorf("symbolic links are not allowed")
	}

	if !info.Mode().IsRegular() {
		return result, fmt.Errorf("input is not a regular file")
	}

	result.Size = info.Size()

	if result.Size <= 0 {
		return result, fmt.Errorf("file is empty")
	}

	file, err := os.Open(filePath)
	if err != nil {
		return result, fmt.Errorf("file is not readable: %w", err)
	}

	header := make([]byte, 16)
	n, readErr := file.Read(header)
	closeErr := file.Close()

	if readErr != nil && readErr != io.EOF {
		return result, fmt.Errorf("cannot read file header: %w", readErr)
	}
	if closeErr != nil {
		return result, fmt.Errorf("cannot close file after inspection: %w", closeErr)
	}

	header = header[:n]
	result.FormatDetected = detectFormat(header)

	effectiveFormat := declaredFormat
	if effectiveFormat == FormatAuto {
		effectiveFormat = result.FormatHint
	}

	isDiskImage := effectiveFormat == FormatE01 ||
		effectiveFormat == FormatEx01 ||
		effectiveFormat == FormatRAW ||
		effectiveFormat == FormatDD ||
		effectiveFormat == FormatIMG

	if !isBatch && isDiskImage {
		if result.Size > options.MaxImageBytes {
			return result, fmt.Errorf(
				"disk image exceeds the configured limit of %d bytes",
				options.MaxImageBytes,
			)
		}
	} else {
		// Ordinary files and directory batches use the batch size limit.
		if result.Size > options.MaxBatchBytes {
			return result, fmt.Errorf(
				"file exceeds the configured limit of %d bytes",
				options.MaxBatchBytes,
			)
		}
	}

	switch effectiveFormat {
	case FormatE01, FormatEx01:
		if result.FormatDetected != FormatEWF {
			return result, fmt.Errorf(
				"expected an EWF image, but its header did not match a recognized EWF signature",
			)
		}

		result.Notes = append(result.Notes,
			"EWF signature recognized; full structure, segment and integrity validation requires an EWF parser")

	case FormatRAW, FormatDD, FormatIMG:
		result.Notes = append(result.Notes,
			"raw disk image formats cannot generally be confirmed by a unique file signature")

	case FormatZIP:
		if result.FormatDetected != FormatZIP {
			return result, fmt.Errorf("file does not have a recognized ZIP header")
		}

		if err := validateZIP(filePath, options); err != nil {
			return result, err
		}

	case FormatAuto:
		// No extension hint or explicit format: retain the detected type.
		if result.FormatDetected == FormatUnknown {
			result.Notes = append(result.Notes,
				"file type could not be identified from the inspected header")
		}

	default:
		if result.FormatDetected == FormatUnknown {
			result.Notes = append(result.Notes,
				"file type could not be identified from the inspected header")
		}
	}

	// Explicitly selecting an ordinary file must not bypass ZIP checks
	// when the actual content is recognized as ZIP.
	if declaredFormat == FormatFile && result.FormatDetected == FormatZIP {
		if err := validateZIP(filePath, options); err != nil {
			return result, err
		}
	}

	result.Valid = true
	return result, nil
}

// formatFromExtension returns an extension-based hint, not proof of format.
func formatFromExtension(filePath string) EvidenceFormat {
	switch strings.ToLower(filepath.Ext(filePath)) {
	case ".e01":
		return FormatE01
	case ".ex01":
		return FormatEx01
	case ".raw":
		return FormatRAW
	case ".dd":
		return FormatDD
	case ".img":
		return FormatIMG
	case ".zip":
		return FormatZIP
	default:
		return FormatAuto
	}
}

// detectFormat identifies selected common formats from their leading bytes.
func detectFormat(header []byte) EvidenceFormat {
	switch {
	case len(header) >= 8 &&
		bytes.Equal(header[:8], []byte{'E', 'V', 'F', 9, 13, 10, 255, 0}):
		return FormatEWF

	case len(header) >= 4 && string(header[:4]) == "EVF2":
		return FormatEWF

	case len(header) >= 4 && string(header[:4]) == "%PDF":
		return FormatPDF

	case len(header) >= 8 &&
		bytes.Equal(header[:8], []byte{137, 'P', 'N', 'G', 13, 10, 26, 10}):
		return FormatPNG

	case len(header) >= 3 &&
		bytes.Equal(header[:3], []byte{255, 216, 255}):
		return FormatJPEG

	case len(header) >= 6 &&
		(string(header[:6]) == "GIF87a" || string(header[:6]) == "GIF89a"):
		return FormatGIF

	case len(header) >= 4 &&
		bytes.Equal(header[:4], []byte{'P', 'K', 3, 4}):
		return FormatZIP

	case len(header) >= 16 &&
		string(header[:16]) == "SQLite format 3\x00":
		return FormatSQLite

	case len(header) >= 4 &&
		bytes.Equal(header[:4], []byte{127, 'E', 'L', 'F'}):
		return FormatELF

	case len(header) >= 2 &&
		bytes.Equal(header[:2], []byte{'M', 'Z'}):
		return FormatPE

	case len(header) >= 2 &&
		bytes.Equal(header[:2], []byte{31, 139}):
		return FormatGZIP

	default:
		return FormatUnknown
	}
}

// validateZIP checks archive paths, entry counts, expanded size and CRCs.
// It does not extract files to disk.
func validateZIP(filePath string, options ValidationOptions) error {
	reader, err := zip.OpenReader(filePath)
	if err != nil {
		return fmt.Errorf("invalid or unreadable ZIP archive: %w", err)
	}
	defer reader.Close()

	if len(reader.File) > options.MaxArchiveEntries {
		return fmt.Errorf(
			"ZIP archive exceeds the entry limit of %d",
			options.MaxArchiveEntries,
		)
	}

	var expandedBytes int64

	for _, entry := range reader.File {
		name := strings.ReplaceAll(entry.Name, "\\", "/")
		cleanName := path.Clean(name)

		// Reject absolute paths, traversal paths and Windows drive paths.
		if path.IsAbs(name) ||
			cleanName == ".." ||
			strings.HasPrefix(cleanName, "../") ||
			(len(name) >= 2 && name[1] == ':') {
			return fmt.Errorf("ZIP contains an unsafe entry path: %q", entry.Name)
		}

		if entry.Mode()&os.ModeSymlink != 0 {
			return fmt.Errorf("ZIP contains a symbolic link: %q", entry.Name)
		}

		if entry.FileInfo().IsDir() {
			continue
		}

		if entry.UncompressedSize64 > uint64(options.MaxArchiveExpandedBytes) {
			return fmt.Errorf("ZIP entry exceeds the expanded-size limit: %q", entry.Name)
		}

		if entry.UncompressedSize64 > uint64(options.MaxArchiveExpandedBytes)-uint64(expandedBytes) {
			return fmt.Errorf("ZIP archive exceeds the total expanded-size limit")
		}

		expandedBytes += int64(entry.UncompressedSize64)

		rc, err := entry.Open()
		if err != nil {
			return fmt.Errorf("cannot open ZIP entry %q: %w", entry.Name, err)
		}

		copied, copyErr := io.Copy(
			io.Discard,
			io.LimitReader(rc, int64(entry.UncompressedSize64)+1),
		)
		closeErr := rc.Close()

		if copyErr != nil {
			return fmt.Errorf("cannot verify ZIP entry %q: %w", entry.Name, copyErr)
		}
		if closeErr != nil {
			return fmt.Errorf("cannot close ZIP entry %q: %w", entry.Name, closeErr)
		}
		if uint64(copied) != entry.UncompressedSize64 {
			return fmt.Errorf("ZIP entry size mismatch: %q", entry.Name)
		}
	}

	return nil
}
