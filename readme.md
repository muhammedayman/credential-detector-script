# Credential Field Detector

Lightweight JavaScript library for detecting username and password fields in web forms.

## Installation

```bash
npm install credential-field-detector
```

## Usage

```javascript
const FieldDetector = require('credential-field-detector');

// Create detector instance
const detector = new FieldDetector();

// Get all password fields
const passwordFields = detector.detectPasswordFields();

// Get all username fields  
const usernameFields = detector.detectUsernameFields();

// Get complete form analysis
const loginForms = detector.getLoginForms();

// Check specific field
const isPassword = detector.isPasswordField(someElement);
const isUsername = detector.isUsernameField(someElement);
```

## Browser Usage

```html
<script src="node_modules/credential-field-detector/field-detector.js"></script>
<script>
  const detector = new FieldDetector();
  const passwordFields = detector.detectPasswordFields();
</script>
```

## API

### Methods

- `detectPasswordFields(document)` - Returns array of password field elements
- `detectUsernameFields(document, passwordField)` - Returns array of username field elements  
- `getLoginForms(document)` - Returns array of complete form analysis objects
- `isPasswordField(field)` - Checks if element is a password field
- `isUsernameField(field, passwordField)` - Checks if element is a username field

## License

MIT