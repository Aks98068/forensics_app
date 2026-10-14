package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleUser    UserRole = "INVESTIGATOR"
	RoleAnalyst UserRole = "ANALYST"
	RoleAdmin   UserRole = "ADMIN"
)

type UserStatus string

const (
	StatusActive  UserStatus = "ACTIVE"
	StatusSuspend UserStatus = "SUSPENDED"
	StatusDisable UserStatus = "DISABLED"
)

type User struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey"`

	Email string `gorm:"type:varchar(255);uniqueIndex;not null"`

	Username string `gorm:"type:varchar(50);uniqueIndex;not null"`

	PasswordHash string `gorm:"type:varchar(255);not null"`

	FirstName string `gorm:"type:varchar(100);not null"`

	LastName string `gorm:"type:varchar(100);not null"`

	Role UserRole `gorm:"type:varchar(20);not null;default:'USER'"`

	Status UserStatus `gorm:"type:varchar(20);not null;default:'ACTIVE'"`

	EmailVerified bool `gorm:"not null;default:false"`

	FailedLoginAttempts int `gorm:"not null;default:0"`

	LockedUntil *time.Time `gorm:"type:timestamptz"`

	LastLoginAt *time.Time `gorm:"type:timestamptz"`

	CreatedAt time.Time

	UpdatedAt time.Time

	RefreshTokens []RefreshToken `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}

	return nil
}

type RefreshToken struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey"`

	UserID uuid.UUID `gorm:"type:uuid;not null;index"`

	TokenHash string `gorm:"type:varchar(64);uniqueIndex;not null"`

	TokenFamily uuid.UUID `gorm:"type:uuid;not null;index"`

	ExpiresAt time.Time `gorm:"not null;index"`

	RevokedAt *time.Time `gorm:"type:timestamptz"`

	ReplacedByTokenID *uuid.UUID `gorm:"type:uuid;index"`

	CreatedAt time.Time

	UserAgent string `gorm:"type:text"`

	IPAddress string `gorm:"type:varchar(45)"`

	User User `gorm:"foreignKey:UserID;references:ID"`
}

func (r *RefreshToken) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}

	if r.TokenFamily == uuid.Nil {
		r.TokenFamily = uuid.New()
	}

	return nil
}

type PasswordResetToken struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey"`
	UserID    uuid.UUID  `gorm:"type:uuid;not null;index"`
	TokenHash string     `gorm:"type:varchar(64);uniqueIndex;not null"`
	ExpiresAt time.Time  `gorm:"not null;index"`
	UsedAt    *time.Time `gorm:"type:timestamptz"`
	RevokedAt *time.Time `gorm:"type:timestamptz"`
	CreatedAt time.Time

	User User `gorm:"foreignKey:UserID;references:ID"`
}

func (p *PasswordResetToken) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}

	return nil
}

type EmailVerificationToken struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey"`
	UserID    uuid.UUID  `gorm:"type:uuid;not null;index"`
	TokenHash string     `gorm:"type:varchar(64);uniqueIndex;not null"`
	ExpiresAt time.Time  `gorm:"not null;index"`
	UsedAt    *time.Time `gorm:"type:timestamptz"`
	RevokedAt *time.Time `gorm:"type:timestamptz"`
	CreatedAt time.Time

	User User `gorm:"foreignKey:UserID;references:ID"`
}

func (e *EmailVerificationToken) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}

	return nil
}

type CaseStatus string

const (
	CaseStatusDraft              CaseStatus = "draft"
	CaseStatusOpen               CaseStatus = "open"
	CaseStatusUnderInvestigation CaseStatus = "under_investigation"
	CaseStatusOnHold             CaseStatus = "on_hold"
	CaseStatusClosed             CaseStatus = "closed"
	CaseStatusArchived           CaseStatus = "archived"
)

type CasePriority string

const (
	CasePriorityLow      CasePriority = "low"
	CasePriorityNormal   CasePriority = "normal"
	CasePriorityHigh     CasePriority = "high"
	CasePriorityCritical CasePriority = "critical"
)

type CaseClassification string

const (
	CaseClassificationPublic       CaseClassification = "public"
	CaseClassificationRestricted   CaseClassification = "restricted"
	CaseClassificationConfidential CaseClassification = "confidential"
	CaseClassificationSecret       CaseClassification = "secret"
)

type CaseType string

const (
	CaseTypeCybercrime        CaseType = "cybercrime"
	CaseTypeDigitalFraud      CaseType = "digital_fraud"
	CaseTypeDeviceExamination CaseType = "device_examination"
	CaseTypeNetworkIncident   CaseType = "network_incident"
	CaseTypeMalwareAnalysis   CaseType = "malware_analysis"
	CaseTypeOther             CaseType = "other"
)

// -----------------------------------------------------------------------------
// CASE
// -----------------------------------------------------------------------------

type Case struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`

	CaseNumber string `gorm:"type:varchar(64);not null;uniqueIndex" json:"caseNumber"`

	Title       string `gorm:"type:varchar(255);not null" json:"title"`
	Description string `gorm:"type:text" json:"description"`

	CaseType       CaseType           `gorm:"type:varchar(50);not null;default:other" json:"caseType"`
	Status         CaseStatus         `gorm:"type:varchar(32);not null;default:draft;index" json:"status"`
	Priority       CasePriority       `gorm:"type:varchar(16);not null;default:normal;index" json:"priority"`
	Classification CaseClassification `gorm:"type:varchar(24);not null;default:restricted;index" json:"classification"`

	Jurisdiction      string `gorm:"type:varchar(255)" json:"jurisdiction"`
	OriginatingAgency string `gorm:"type:varchar(255)" json:"originatingAgency"`

	// Reference only: do not store the warrant or legal document itself here.
	LegalAuthorityRef string `gorm:"type:varchar(255)" json:"legalAuthorityRef"`

	IncidentAt *time.Time `gorm:"index" json:"incidentAt"`
	OpenedAt   *time.Time `json:"openedAt"`
	DueAt      *time.Time `gorm:"index" json:"dueAt"`
	ClosedAt   *time.Time `json:"closedAt"`

	// References to existing users.
	CreatedBy uuid.UUID `gorm:"type:uuid;not null;index" json:"createdBy"`
	UpdatedBy uuid.UUID `gorm:"type:uuid;not null;index" json:"updatedBy"`

	CreatedByUser User `gorm:"foreignKey:CreatedBy;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`
	UpdatedByUser User `gorm:"foreignKey:UpdatedBy;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

	Assignments []CaseAssignment `gorm:"foreignKey:CaseID" json:"assignments,omitempty"`

	CreatedAt time.Time `gorm:"not null;autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"not null;autoUpdateTime" json:"updatedAt"`
}

// -----------------------------------------------------------------------------
// CASE ASSIGNMENTS
// One case -> multiple investigators.
// One investigator -> multiple cases.
// Keep historical assignment records.
// -----------------------------------------------------------------------------

type AssignmentRole string

const (
	AssignmentRoleLead         AssignmentRole = "lead_investigator"
	AssignmentRoleInvestigator AssignmentRole = "investigator"
	AssignmentRoleReviewer     AssignmentRole = "reviewer"
	AssignmentRoleSpecialist   AssignmentRole = "specialist"
)

type AssignmentStatus string

const (
	AssignmentStatusPending   AssignmentStatus = "pending"
	AssignmentStatusAccepted  AssignmentStatus = "accepted"
	AssignmentStatusDeclined  AssignmentStatus = "declined"
	AssignmentStatusRevoked   AssignmentStatus = "revoked"
	AssignmentStatusCompleted AssignmentStatus = "completed"
)

type CaseAssignment struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`

	CaseID uuid.UUID `gorm:"type:uuid;not null;index" json:"caseId"`

	InvestigatorID uuid.UUID `gorm:"type:uuid;not null;index" json:"investigatorId"`

	Role AssignmentRole `gorm:"type:varchar(32);not null;default:investigator" json:"role"`

	Status AssignmentStatus `gorm:"type:varchar(16);not null;default:pending;index" json:"status"`

	AssignedBy uuid.UUID `gorm:"type:uuid;not null;index" json:"assignedBy"`

	Case Case `gorm:"foreignKey:CaseID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

	Investigator User `gorm:"foreignKey:InvestigatorID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

	AssignedByUser User `gorm:"foreignKey:AssignedBy;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

	AssignedAt time.Time `gorm:"not null;autoCreateTime" json:"assignedAt"`

	AcceptedAt *time.Time `gorm:"type:timestamptz" json:"acceptedAt,omitempty"`

	RevokedAt *time.Time `gorm:"type:timestamptz" json:"revokedAt,omitempty"`

	CompletedAt *time.Time `gorm:"type:timestamptz" json:"completedAt,omitempty"`

	Notes string `gorm:"type:text" json:"notes"`

	CreatedAt time.Time `gorm:"not null;autoCreateTime" json:"createdAt"`

	UpdatedAt time.Time `gorm:"not null;autoUpdateTime" json:"updatedAt"`
}

// -----------------------------------------------------------------------------
// AUDIT LOG
// Application code should INSERT audit events, not edit or delete them.
// Enforce immutability with PostgreSQL permissions and/or a trigger.
// -----------------------------------------------------------------------------

type AuditOutcome string

const (
	AuditOutcomeSuccess AuditOutcome = "success"
	AuditOutcomeFailure AuditOutcome = "failure"
)

type AuditLog struct {
	ID uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`

	// Nullable for system-generated events without a human actor.
	ActorID *uuid.UUID `gorm:"type:uuid;index" json:"actorId"`

	Actor User `gorm:"foreignKey:ActorID;references:ID;constraint:OnUpdate:RESTRICT,OnDelete:RESTRICT" json:"-"`

	Action       string     `gorm:"type:varchar(100);not null;index" json:"action"`
	ResourceType string     `gorm:"type:varchar(64);not null;index" json:"resourceType"`
	ResourceID   *uuid.UUID `gorm:"type:uuid;index" json:"resourceId"`

	Outcome AuditOutcome `gorm:"type:varchar(16);not null;default:success" json:"outcome"`

	// Store structured, minimized snapshots or change descriptions as JSONB.
	BeforeState datatypes.JSON `gorm:"type:jsonb" json:"beforeState,omitempty"`
	AfterState  datatypes.JSON `gorm:"type:jsonb" json:"afterState,omitempty"`
	Details     datatypes.JSON `gorm:"type:jsonb" json:"details,omitempty"`

	RequestID string `gorm:"type:varchar(128);index" json:"requestId"`
	SourceIP  string `gorm:"type:inet" json:"sourceIp"`
	UserAgent string `gorm:"type:text" json:"userAgent"`

	OccurredAt time.Time `gorm:"not null;autoCreateTime;index" json:"occurredAt"`
}

// -----------------------------------------------------------------------------
// MIGRATION
// Call this from your existing database initialization.
// Do not migrate a replacement User model over your existing user schema.
// -----------------------------------------------------------------------------
