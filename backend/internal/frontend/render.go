package frontend

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// ============================================================
// APPLICATION CONFIGURATION
// ============================================================

const (
	DefaultAppName        = "FORENSIQ"
	DefaultDescription    = "Digital Forensics Platform"
	DefaultPageTitle      = "FORENSIQ"
	DefaultNotFoundTitle  = "Page Not Found"
	DefaultNotFoundStatus = http.StatusNotFound
)

// ============================================================
// USER VIEW
// ============================================================
//
// UserView is optional frontend context.
//
// IMPORTANT:
//
// Dashboard pages are public HTML shells in the current
// architecture. Sensitive user information should therefore
// NOT be placed directly into the initial dashboard HTML.
//
// Dashboard JavaScript should request protected API data using
// the JWT access token.
//
// ============================================================

type UserView struct {
	ID    string
	Name  string
	Email string
	Role  string
}

// ============================================================
// PAGE DATA
// ============================================================

type PageData struct {
	AppName string

	Title       string
	Description string

	Year int

	User *UserView

	IsAuthenticated bool

	ActivePage string

	Data any
}

// ============================================================
// RENDERER
// ============================================================

type Renderer struct {
	publicDir string

	appName     string
	description string

	devMode bool

	mu    sync.RWMutex
	cache map[string]*template.Template
}

// ============================================================
// NEW RENDERER
// ============================================================

func NewRenderer(publicDir string) (*Renderer, error) {

	absolutePath, err := filepath.Abs(publicDir)
	if err != nil {
		return nil, fmt.Errorf(
			"resolve frontend directory: %w",
			err,
		)
	}

	info, err := os.Stat(absolutePath)
	if err != nil {
		return nil, fmt.Errorf(
			"frontend directory %s: %w",
			absolutePath,
			err,
		)
	}

	if !info.IsDir() {
		return nil, fmt.Errorf(
			"frontend path is not a directory: %s",
			absolutePath,
		)
	}

	return &Renderer{
		publicDir:   absolutePath,
		appName:     DefaultAppName,
		description: DefaultDescription,
		cache:       make(map[string]*template.Template),
	}, nil
}

// ============================================================
// PUBLIC DIRECTORY
// ============================================================

func (r *Renderer) PublicDir() string {

	r.mu.RLock()
	defer r.mu.RUnlock()

	return r.publicDir
}

// ============================================================
// APPLICATION INFORMATION
// ============================================================

func (r *Renderer) SetAppName(name string) {

	name = strings.TrimSpace(name)

	if name == "" {
		name = DefaultAppName
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	r.appName = name
}

func (r *Renderer) SetDescription(description string) {

	description = strings.TrimSpace(description)

	if description == "" {
		description = DefaultDescription
	}

	r.mu.Lock()
	defer r.mu.Unlock()

	r.description = description
}

func (r *Renderer) applicationInfo() (string, string) {

	r.mu.RLock()
	defer r.mu.RUnlock()

	return r.appName, r.description
}

// ============================================================
// DEV MODE
// ============================================================

func (r *Renderer) SetDevMode(enabled bool) {

	r.mu.Lock()
	defer r.mu.Unlock()

	r.devMode = enabled
}

func (r *Renderer) isDevMode() bool {

	r.mu.RLock()
	defer r.mu.RUnlock()

	return r.devMode
}

// ============================================================
// STARTUP CHECK
// ============================================================

func (r *Renderer) CheckPages(pages ...string) {

	for _, page := range pages {

		path := filepath.Join(
			r.publicDir,
			"templates",
			"pages",
			page+".html",
		)

		if _, err := os.Stat(path); err != nil {

			log.Printf(
				"WARNING: page template missing: %s",
				path,
			)

			continue
		}

		log.Printf(
			"page template OK: %s",
			path,
		)
	}
}

// ============================================================
// REGISTER PUBLIC FRONTEND
// ============================================================
//
// These routes contain:
//
// - Home
// - Login
// - Register
// - Email verification
// - Forgot password
// - Reset password
//
// ============================================================

func (r *Renderer) RegisterPublic(router *gin.Engine) {

	publicDir := r.PublicDir()

	// ========================================================
	// STATIC FILES
	// ========================================================

	router.Static(
		"/css",
		filepath.Join(publicDir, "css"),
	)

	router.Static(
		"/js",
		filepath.Join(publicDir, "js"),
	)

	router.Static(
		"/assets",
		filepath.Join(publicDir, "assets"),
	)

	// ========================================================
	// FAVICON
	// ========================================================

	faviconPath := filepath.Join(
		publicDir,
		"favicon.ico",
	)

	if _, err := os.Stat(faviconPath); err == nil {

		router.StaticFile(
			"/favicon.ico",
			faviconPath,
		)
	}

	// ========================================================
	// HOME
	// ========================================================

	router.GET(
		"/",
		func(c *gin.Context) {

			r.Render(
				c,
				"home",
				PageData{
					Title: "Home",
				},
			)
		},
	)

	// ========================================================
	// AUTH PAGES
	// ========================================================

	publicPages := map[string]string{
		"/login":           "login",
		"/register":        "register",
		"/verify-email":    "verify-email",
		"/forgot-password": "forgot-password",
		"/reset-password":  "reset-password",
	}

	for route, page := range publicPages {

		route := route
		page := page

		router.GET(
			route,
			func(c *gin.Context) {

				r.Render(
					c,
					page,
					PageData{
						Title: pageTitle(page),
					},
				)
			},
		)
	}
}

// ============================================================
// USER FRONTEND
// ============================================================
//
// IMPORTANT:
//
// These are PUBLIC HTML SHELL routes.
//
// They do NOT use JWT authentication.
//
// Sensitive information must be loaded through:
//
// /api/v1/protected/user/*
//
// ============================================================

func (r *Renderer) RegisterUserFrontend(
	router *gin.Engine,
) {

	// ========================================================
	// DASHBOARD
	// ========================================================

	router.GET(
		"/dashboard",
		func(c *gin.Context) {

			r.Render(
				c,
				"user/dashboard",
				PageData{
					Title:      "Dashboard",
					ActivePage: "dashboard",
				},
			)
		},
	)

	// ========================================================
	// CASES
	// ========================================================

	router.GET(
		"/dashboard/cases",
		func(c *gin.Context) {

			r.Render(
				c,
				"user/cases",
				PageData{
					Title:      "Cases",
					ActivePage: "cases",
				},
			)
		},
	)

	// ========================================================
	// EVIDENCE
	// ========================================================

	router.GET(
		"/dashboard/evidence",
		func(c *gin.Context) {

			r.Render(
				c,
				"user/evidence",
				PageData{
					Title:      "Evidence",
					ActivePage: "evidence",
				},
			)
		},
	)

	// ========================================================
	// REPORTS
	// ========================================================

	router.GET(
		"/dashboard/reports",
		func(c *gin.Context) {

			r.Render(
				c,
				"user/reports",
				PageData{
					Title:      "Reports",
					ActivePage: "reports",
				},
			)
		},
	)

	// ========================================================
	// ACTIVITY
	// ========================================================

	router.GET(
		"/dashboard/activity",
		func(c *gin.Context) {

			r.Render(
				c,
				"user/activity",
				PageData{
					Title:      "Activity",
					ActivePage: "activity",
				},
			)
		},
	)

	// ========================================================
	// PROFILE
	// ========================================================

	router.GET(
		"/dashboard/profile",
		func(c *gin.Context) {

			r.Render(
				c,
				"user/profile",
				PageData{
					Title:      "Profile",
					ActivePage: "profile",
				},
			)
		},
	)

	// ========================================================
	// SETTINGS
	// ========================================================

	router.GET(
		"/dashboard/settings",
		func(c *gin.Context) {

			r.Render(
				c,
				"user/settings",
				PageData{
					Title:      "Settings",
					ActivePage: "settings",
				},
			)
		},
	)
}

// ============================================================
// ANALYST FRONTEND
// ============================================================
//
// These are PUBLIC HTML SHELL routes.
//
// Sensitive analyst data must come through:
//
// /api/v1/protected/analyst/*
//
// ============================================================

func (r *Renderer) RegisterAnalystFrontend(
	router *gin.Engine,
) {

	// ========================================================
	// DASHBOARD
	// ========================================================

	router.GET(
		"/analyst",
		func(c *gin.Context) {

			r.Render(
				c,
				"analyst/dashboard",
				PageData{
					Title:      "Analyst Dashboard",
					ActivePage: "dashboard",
				},
			)
		},
	)

	// ========================================================
	// CASES
	// ========================================================

	router.GET(
		"/analyst/cases",
		func(c *gin.Context) {

			r.Render(
				c,
				"analyst/cases",
				PageData{
					Title:      "Cases",
					ActivePage: "cases",
				},
			)
		},
	)

	// ========================================================
	// EVIDENCE
	// ========================================================

	router.GET(
		"/analyst/evidence",
		func(c *gin.Context) {

			r.Render(
				c,
				"analyst/evidence",
				PageData{
					Title:      "Evidence",
					ActivePage: "evidence",
				},
			)
		},
	)

	// ========================================================
	// REPORTS
	// ========================================================

	router.GET(
		"/analyst/reports",
		func(c *gin.Context) {

			r.Render(
				c,
				"analyst/reports",
				PageData{
					Title:      "Reports",
					ActivePage: "reports",
				},
			)
		},
	)

	// ========================================================
	// ACTIVITY
	// ========================================================

	router.GET(
		"/analyst/activity",
		func(c *gin.Context) {

			r.Render(
				c,
				"analyst/activity",
				PageData{
					Title:      "Activity",
					ActivePage: "activity",
				},
			)
		},
	)

	// ========================================================
	// PROFILE
	// ========================================================

	router.GET(
		"/analyst/profile",
		func(c *gin.Context) {

			r.Render(
				c,
				"analyst/profile",
				PageData{
					Title:      "Profile",
					ActivePage: "profile",
				},
			)
		},
	)

	// ========================================================
	// SETTINGS
	// ========================================================

	router.GET(
		"/analyst/settings",
		func(c *gin.Context) {

			r.Render(
				c,
				"analyst/settings",
				PageData{
					Title:      "Settings",
					ActivePage: "settings",
				},
			)
		},
	)
}

// ============================================================
// ADMIN FRONTEND
// ============================================================
//
// These are PUBLIC HTML SHELL routes.
//
// Sensitive administrator data must come through:
//
// /api/v1/protected/admin/*
//
// ============================================================

func (r *Renderer) RegisterAdminFrontend(
	router *gin.Engine,
) {

	// ========================================================
	// DASHBOARD
	// ========================================================

	router.GET(
		"/admin",
		func(c *gin.Context) {

			r.Render(
				c,
				"admin/dashboard",
				PageData{
					Title:      "Admin Dashboard",
					ActivePage: "dashboard",
				},
			)
		},
	)

	// ========================================================
	// USERS
	// ========================================================

	router.GET(
		"/admin/users",
		func(c *gin.Context) {

			r.Render(
				c,
				"admin/users",
				PageData{
					Title:      "Users",
					ActivePage: "users",
				},
			)
		},
	)

	// ========================================================
	// CASES
	// ========================================================

	router.GET(
		"/admin/cases",
		func(c *gin.Context) {

			r.Render(
				c,
				"admin/cases",
				PageData{
					Title:      "Cases",
					ActivePage: "cases",
				},
			)
		},
	)

	// ========================================================
	// EVIDENCE
	// ========================================================

	router.GET(
		"/admin/evidence",
		func(c *gin.Context) {

			r.Render(
				c,
				"admin/evidence",
				PageData{
					Title:      "Evidence",
					ActivePage: "evidence",
				},
			)
		},
	)

	// ========================================================
	// REPORTS
	// ========================================================

	router.GET(
		"/admin/reports",
		func(c *gin.Context) {

			r.Render(
				c,
				"admin/reports",
				PageData{
					Title:      "Reports",
					ActivePage: "reports",
				},
			)
		},
	)

	// ========================================================
	// AUDIT LOGS
	// ========================================================

	router.GET(
		"/admin/audit-logs",
		func(c *gin.Context) {

			r.Render(
				c,
				"admin/audit-logs",
				PageData{
					Title:      "Audit Logs",
					ActivePage: "audit-logs",
				},
			)
		},
	)

	// ========================================================
	// SETTINGS
	// ========================================================

	router.GET(
		"/admin/settings",
		func(c *gin.Context) {

			r.Render(
				c,
				"admin/settings",
				PageData{
					Title:      "Settings",
					ActivePage: "settings",
				},
			)
		},
	)

	// ========================================================
	// PROFILE
	// ========================================================

	router.GET(
		"/admin/profile",
		func(c *gin.Context) {

			r.Render(
				c,
				"admin/profile",
				PageData{
					Title:      "Profile",
					ActivePage: "profile",
				},
			)
		},
	)
}

// ============================================================
// FALLBACK
// ============================================================

func (r *Renderer) RegisterFallback(
	router *gin.Engine,
) {

	router.NoRoute(
		r.PageHandler(),
	)
}

// ============================================================
// MAIN FRONTEND REGISTRATION
// ============================================================
//
// This registers:
//
// 1. Public pages
// 2. User dashboard shell
// 3. Analyst dashboard shell
// 4. Admin dashboard shell
// 5. 404 fallback
//
// No JWT middleware is applied here.
//
// ============================================================

func (r *Renderer) Register(
	router *gin.Engine,
) {

	// Public frontend.
	r.RegisterPublic(router)

	// Public dashboard shells.
	r.RegisterUserFrontend(router)
	r.RegisterAnalystFrontend(router)
	r.RegisterAdminFrontend(router)

	// Fallback.
	r.RegisterFallback(router)
}

// ============================================================
// RENDER
// ============================================================

func (r *Renderer) Render(
	c *gin.Context,
	page string,
	data PageData,
) {

	tmpl, err := r.templateForPage(page)

	if err != nil {

		log.Printf(
			"frontend render error for page %q: %v",
			page,
			err,
		)

		c.Error(err)

		c.String(
			http.StatusInternalServerError,
			"template rendering error",
		)

		return
	}

	appName, description := r.applicationInfo()

	data.AppName = appName
	data.Year = time.Now().Year()

	if data.Description == "" {
		data.Description = description
	}

	if data.Title == "" {
		data.Title = pageTitle(page)
	}

	// ========================================================
	// OPTIONAL AUTHENTICATED USER
	// ========================================================
	//
	// This remains supported for future authenticated
	// server-rendered pages.
	//
	// The current dashboard architecture does not depend
	// on this value because dashboard pages are public shells.
	//
	// ========================================================

	if value, exists := c.Get("frontendUser"); exists {

		switch user := value.(type) {

		case *UserView:

			data.User = user
			data.IsAuthenticated = true

		case UserView:

			data.User = &user
			data.IsAuthenticated = true
		}
	}

	// ========================================================
	// RENDER
	// ========================================================

	c.Status(http.StatusOK)

	if err := tmpl.ExecuteTemplate(
		c.Writer,
		"base",
		data,
	); err != nil {

		log.Printf(
			"frontend execute error for page %q: %v",
			page,
			err,
		)

		c.Error(err)
	}
}

// ============================================================
// TEMPLATE LOADING
// ============================================================

func (r *Renderer) templateForPage(
	page string,
) (*template.Template, error) {

	page = strings.TrimSpace(page)

	page = strings.TrimPrefix(
		page,
		"/",
	)

	page = strings.TrimSuffix(
		page,
		"/",
	)

	if page == "" {
		page = "home"
	}

	// ========================================================
	// SECURITY
	// ========================================================

	if strings.Contains(page, "..") {
		return nil, fmt.Errorf(
			"invalid frontend page path",
		)
	}

	if strings.Contains(page, "\\") {
		return nil, fmt.Errorf(
			"invalid frontend page path",
		)
	}

	if !isSafePageName(page) {
		return nil, fmt.Errorf(
			"invalid frontend page name: %s",
			page,
		)
	}

	// ========================================================
	// CACHE
	// ========================================================

	devMode := r.isDevMode()

	if !devMode {

		r.mu.RLock()

		cached, exists := r.cache[page]

		r.mu.RUnlock()

		if exists {
			return cached, nil
		}
	}

	// ========================================================
	// DIRECTORIES
	// ========================================================

	templatesDir := filepath.Join(
		r.publicDir,
		"templates",
	)

	layoutsDir := filepath.Join(
		templatesDir,
		"layouts",
	)

	componentsDir := filepath.Join(
		templatesDir,
		"components",
	)

	pagesDir := filepath.Join(
		templatesDir,
		"pages",
	)

	// ========================================================
	// BASE LAYOUT
	// ========================================================

	basePath := filepath.Join(
		layoutsDir,
		"base.html",
	)

	// ========================================================
	// DASHBOARD LAYOUT
	// ========================================================

	dashboardPath := filepath.Join(
		layoutsDir,
		"dashboard.html",
	)

	// ========================================================
	// PAGE
	// ========================================================

	pagePath := filepath.Join(
		pagesDir,
		page+".html",
	)

	// ========================================================
	// COMPONENTS
	// ========================================================

	componentFiles, err := filepath.Glob(
		filepath.Join(
			componentsDir,
			"*.html",
		),
	)

	if err != nil {

		return nil, fmt.Errorf(
			"list component templates: %w",
			err,
		)
	}

	// ========================================================
	// DETERMINE LAYOUT
	// ========================================================

	isDashboard := isDashboardPage(page)

	// ========================================================
	// BUILD FILE LIST
	// ========================================================

	files := make(
		[]string,
		0,
		len(componentFiles)+3,
	)

	// Base is always required.
	files = append(
		files,
		basePath,
	)

	// Dashboard pages additionally load dashboard layout.
	if isDashboard {

		if _, err := os.Stat(dashboardPath); err != nil {

			return nil, fmt.Errorf(
				"dashboard layout not found: %w",
				err,
			)
		}

		files = append(
			files,
			dashboardPath,
		)
	}

	// Components.
	files = append(
		files,
		componentFiles...,
	)

	// Actual page.
	files = append(
		files,
		pagePath,
	)

	// ========================================================
	// VERIFY
	// ========================================================

	for _, path := range files {

		info, err := os.Stat(path)

		if err != nil {

			return nil, fmt.Errorf(
				"template file not found %s: %w",
				path,
				err,
			)
		}

		if info.IsDir() {

			return nil, fmt.Errorf(
				"template path is a directory: %s",
				path,
			)
		}
	}

	// ========================================================
	// PARSE
	// ========================================================

	tmpl, err := template.
		New("base").
		Option("missingkey=error").
		ParseFiles(files...)

	if err != nil {

		return nil, fmt.Errorf(
			"parse frontend templates: %w",
			err,
		)
	}

	// ========================================================
	// CACHE
	// ========================================================

	if !devMode {

		r.mu.Lock()

		r.cache[page] = tmpl

		r.mu.Unlock()
	}

	return tmpl, nil
}

// ============================================================
// DETERMINE DASHBOARD PAGE
// ============================================================

func isDashboardPage(page string) bool {

	page = strings.Trim(
		page,
		"/",
	)

	if page == "" {
		return false
	}

	return strings.HasPrefix(page, "user/") ||
		strings.HasPrefix(page, "analyst/") ||
		strings.HasPrefix(page, "admin/")
}

// ============================================================
// PAGE NAME SECURITY
// ============================================================

func isSafePageName(page string) bool {

	if page == "" {
		return false
	}

	for _, char := range page {

		switch {

		case char >= 'a' && char <= 'z':
		case char >= 'A' && char <= 'Z':
		case char >= '0' && char <= '9':
		case char == '-':
		case char == '_':
		case char == '/':
		default:
			return false
		}
	}

	return true
}

// ============================================================
// FRONTEND FALLBACK
// ============================================================
//
// IMPORTANT:
//
// Dashboard routes are NOT blocked here.
//
// They are registered explicitly above.
//
// Therefore:
//
// /dashboard
// /dashboard/cases
// /analyst
// /admin
//
// are handled by their explicit routes.
//
// ============================================================

func (r *Renderer) PageHandler() gin.HandlerFunc {

	return func(c *gin.Context) {

		path := c.Request.URL.Path

		// ====================================================
		// API
		// ====================================================

		if path == "/api" ||
			strings.HasPrefix(path, "/api/") {

			c.JSON(
				http.StatusNotFound,
				gin.H{
					"error": "API endpoint not found",
				},
			)

			return
		}

		// ====================================================
		// STATIC FILES
		// ====================================================

		if path == "/css" ||
			strings.HasPrefix(path, "/css/") ||
			path == "/js" ||
			strings.HasPrefix(path, "/js/") ||
			path == "/assets" ||
			strings.HasPrefix(path, "/assets/") {

			c.JSON(
				http.StatusNotFound,
				gin.H{
					"error": "static file not found",
				},
			)

			return
		}

		// ====================================================
		// HOME
		// ====================================================

		if path == "/" || path == "" {

			r.Render(
				c,
				"home",
				PageData{
					Title: "Home",
				},
			)

			return
		}

		// ====================================================
		// NORMALIZE
		// ====================================================

		path = strings.Trim(
			path,
			"/",
		)

		if path == "" {

			r.Render(
				c,
				"home",
				PageData{
					Title: "Home",
				},
			)

			return
		}

		// ====================================================
		// SECURITY
		// ====================================================

		if !isSafePageName(path) {

			log.Printf(
				"frontend 404: unsafe page name %q",
				c.Request.URL.Path,
			)

			r.notFound(c)

			return
		}

		// ====================================================
		// PUBLIC TEMPLATE FALLBACK
		// ====================================================
		//
		// Explicit dashboard routes have already been handled
		// by Gin before NoRoute reaches this function.
		//
		// We therefore do not need to block:
		//
		// dashboard
		// analyst
		// admin
		//
		// here.
		//
		// ====================================================

		pagePath := filepath.Join(
			r.publicDir,
			"templates",
			"pages",
			path+".html",
		)

		info, err := os.Stat(pagePath)

		if err != nil {

			if os.IsNotExist(err) {

				log.Printf(
					"frontend 404: no template for %q",
					c.Request.URL.Path,
				)

				r.notFound(c)

				return
			}

			c.Error(err)

			c.String(
				http.StatusInternalServerError,
				"frontend error",
			)

			return
		}

		if info.IsDir() {

			r.notFound(c)

			return
		}

		// ====================================================
		// RENDER
		// ====================================================

		r.Render(
			c,
			path,
			PageData{
				Title: pageTitle(path),
			},
		)
	}
}

// ============================================================
// 404
// ============================================================

func (r *Renderer) notFound(
	c *gin.Context,
) {

	tmpl, err := r.templateForPage("404")

	if err != nil {

		c.String(
			DefaultNotFoundStatus,
			"404 - Page not found",
		)

		return
	}

	appName, description := r.applicationInfo()

	data := PageData{
		AppName: appName,

		Title: DefaultNotFoundTitle,

		Description: description,

		Year: time.Now().Year(),
	}

	c.Status(DefaultNotFoundStatus)

	if err := tmpl.ExecuteTemplate(
		c.Writer,
		"base",
		data,
	); err != nil {

		c.String(
			DefaultNotFoundStatus,
			"404 - Page not found",
		)
	}
}

// ============================================================
// PAGE TITLE
// ============================================================

func pageTitle(page string) string {

	page = strings.TrimSpace(page)

	if page == "" || page == "home" {
		return DefaultPageTitle
	}

	page = strings.ReplaceAll(
		page,
		"-",
		" ",
	)

	page = strings.ReplaceAll(
		page,
		"_",
		" ",
	)

	page = strings.ReplaceAll(
		page,
		"/",
		" ",
	)

	words := strings.Fields(page)

	for i, word := range words {

		if word == "" {
			continue
		}

		runes := []rune(word)

		if len(runes) == 0 {
			continue
		}

		runes[0] = []rune(
			strings.ToUpper(
				string(runes[0]),
			),
		)[0]

		words[i] = string(runes)
	}

	title := strings.Join(
		words,
		" ",
	)

	if title == "" {
		return DefaultPageTitle
	}

	return title
}
