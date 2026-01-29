# Security

This package includes several security measures to protect against common vulnerabilities.

## XSS Prevention

- **URL Sanitization**: All URLs in markdown links are sanitized. Only `http:`, `https:`, `mailto:`, and `tel:` protocols are allowed. Potentially dangerous protocols like `javascript:` and `data:` are blocked.
- **Markdown Rendering**: Uses `react-markdown` which provides safe HTML rendering by default. The content is not passed through `dangerouslySetInnerHTML`.
- **External Links**: All external links include `rel="noopener noreferrer nofollow"` attributes.

## JSON Parsing Protection

The streaming utilities include protection against malicious payloads:

```tsx
import { safeJsonParse, DEFAULT_MAX_JSON_SIZE, DEFAULT_MAX_JSON_DEPTH } from '@pulse8-ai/chat'

// Parse with default limits (1MB size, 100 levels depth)
const data = safeJsonParse(jsonString)

// Or with custom limits
const data = safeJsonParse(jsonString, 512 * 1024, 50) // 512KB, 50 levels
```

## File Upload Security

When implementing file uploads:

1. **Validate file types** on both client and server
2. **Set size limits** appropriate for your use case
3. **Scan uploaded files** for malware on the server
4. **Store files securely** with proper access controls

```tsx
// Example: Client-side validation
const handleUpload = async (file: File) => {
  // Check file type
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed')
  }

  // Check file size (e.g., 10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must be less than 10MB')
  }

  // Proceed with upload
  return await uploadToServer(file)
}
```

## Content Security Policy (CSP)

For production deployments, we recommend implementing a strict CSP:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

## Reporting Security Issues

If you discover a security vulnerability, please email security@pulse8.ai instead of opening a public issue.
