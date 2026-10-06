package middlewares

import (
	"strings"

	"github.com/gin-gonic/gin"
)

// buildContentSecurityPolicy returns the CSP for the current mode.
//
// Production (release mode):
//   - allows Cloudflare Web Analytics (beacon script + its reporting endpoint)
//   - keeps 'unsafe-inline' scripts because Next.js emits inline bootstrap scripts
//   - keeps upgrade-insecure-requests (the site is served over HTTPS)
//
// Development (anything other than release mode):
//   - adds 'unsafe-eval' (required by next dev / React refresh)
//   - allows ws:/wss: for the hot-reload websocket
//   - drops upgrade-insecure-requests so http://localhost keeps working
func buildContentSecurityPolicy(dev bool) string {

	scriptSrc := []string{
		"'self'",
		"'unsafe-inline'",
		"https://static.cloudflareinsights.com",
	}

	connectSrc := []string{
		"'self'",
		"https://cloudflareinsights.com",
	}

	if dev {
		scriptSrc = append(scriptSrc, "'unsafe-eval'")
		connectSrc = append(connectSrc, "ws:", "wss:")
	}

	directives := []string{
		"default-src 'self'",
		"script-src " + strings.Join(scriptSrc, " "),
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob:",
		"font-src 'self' data:",
		"connect-src " + strings.Join(connectSrc, " "),
		"form-action 'self'",
		"base-uri 'self'",
		"frame-ancestors 'none'",
		"object-src 'none'",
		"manifest-src 'self'",
		"worker-src 'self' blob:",
	}

	if !dev {
		directives = append(directives, "upgrade-insecure-requests")
	}

	return strings.Join(directives, "; ")
}

func SecurityHeaders() gin.HandlerFunc {

	// Built once when the middleware is created.
	csp := buildContentSecurityPolicy(gin.Mode() != gin.ReleaseMode)

	return func(c *gin.Context) {

		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header(
			"Permissions-Policy",
			"camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()",
		)
		c.Header("Content-Security-Policy", csp)
		c.Header("Cross-Origin-Opener-Policy", "same-origin")
		c.Header("Cross-Origin-Resource-Policy", "same-origin")
		c.Header("X-Permitted-Cross-Domain-Policies", "none")
		c.Header("X-DNS-Prefetch-Control", "off")

		if strings.HasPrefix(c.Request.URL.Path, "/api/") {
			c.Header("Cache-Control", "no-store, no-cache, must-revalidate, private")
			c.Header("Pragma", "no-cache")
			c.Header("Expires", "0")
		}

		c.Next()
	}
}