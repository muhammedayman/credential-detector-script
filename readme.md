// Usage example:
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
