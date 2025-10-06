/**
 * Field Detection Class
 * Detects username and password fields in web forms
 */
class FieldDetector {
  constructor() {
    this.usernameFieldNames = [
      "username", "user name", "userid", "user id", "customer id", "login id", "login",
      "benutzername", "benutzer name", "benutzerid", "benutzer id",
      "email", "email address", "e-mail", "e-mail address",
      "email adresse", "e-mail adresse"
    ];

    this.passwordFieldExcludeList = [
      "hint", "captcha", "findanything", "forgot", "totp", "totpcode", "2facode",
      "mfacode", "otc-code", "onetimecode", "otp-code", "otpcode", "security_code",
      "twofactor", "twofa", "twofactorcode", "verificationcode", "verification code"
    ];

    this.excludedInputTypes = new Set([
      "hidden", "submit", "reset", "button", "image", "file", "radio", "checkbox"
    ]);

    this.searchFieldNames = new Set(["search", "query", "find", "go"]);
  }

  /**
   * Detects password fields in the document
   * @param {Document} document - The document to search in
   * @returns {HTMLElement[]} Array of password field elements
   */
  detectPasswordFields(document = window.document) {
    const passwordFields = [];
    const allInputs = document.querySelectorAll('input, textarea');

    for (const field of allInputs) {
      if (this.isPasswordField(field)) {
        passwordFields.push(field);
      }
    }

    return passwordFields;
  }

  /**
   * Detects username fields in the document
   * @param {Document} document - The document to search in
   * @param {HTMLElement} passwordField - Optional password field to find username relative to
   * @returns {HTMLElement[]} Array of username field elements
   */
  detectUsernameFields(document = window.document, passwordField = null) {
    const usernameFields = [];
    const allInputs = document.querySelectorAll('input');

    for (const field of allInputs) {
      if (this.isUsernameField(field, passwordField)) {
        usernameFields.push(field);
      }
    }

    return usernameFields;
  }

  /**
   * Checks if a field is a password field
   * @param {HTMLElement} field - The field to check
   * @returns {boolean} True if field is a password field
   */
  isPasswordField(field) {
    if (!field || field.disabled) return false;

    // Direct password type check
    if (field.type === 'password') {
      return !this.hasDisqualifyingValue(field);
    }

    // Text field that looks like password
    if (field.type === 'text' && this.isLikePassword(field)) {
      return !this.hasDisqualifyingValue(field);
    }

    return false;
  }

  /**
   * Checks if a field is a username field
   * @param {HTMLElement} field - The field to check
   * @param {HTMLElement} passwordField - Optional password field for context
   * @returns {boolean} True if field is a username field
   */
  isUsernameField(field, passwordField = null) {
    if (!field || field.disabled || this.excludedInputTypes.has(field.type)) {
      return false;
    }

    // Must be text, email, or tel input
    if (!['text', 'email', 'tel'].includes(field.type)) {
      return false;
    }

    // Check if it's a search field
    if (this.isSearchField(field)) {
      return false;
    }

    // If password field provided, username should come before it
    if (passwordField && this.getElementIndex(field) >= this.getElementIndex(passwordField)) {
      return false;
    }

    // Check if field matches username patterns
    return this.matchesUsernamePattern(field);
  }

  /**
   * Checks if field has password-like characteristics
   * @param {HTMLElement} field - The field to check
   * @returns {boolean} True if field looks like password
   */
  isLikePassword(field) {
    const values = [field.id, field.name, field.placeholder].filter(Boolean);
    
    for (const value of values) {
      const cleanValue = value.toLowerCase().replace(/[\s_-]/g, '');
      if (cleanValue.includes('password') && 
          !this.passwordFieldExcludeList.some(exclude => cleanValue.includes(exclude))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if field matches username patterns
   * @param {HTMLElement} field - The field to check
   * @returns {boolean} True if field matches username patterns
   */
  matchesUsernamePattern(field) {
    const attributes = [
      field.id, field.name, field.placeholder,
      this.getFieldLabel(field), field.getAttribute('aria-label')
    ].filter(Boolean);

    for (const attr of attributes) {
      const cleanAttr = attr.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '');
      if (this.usernameFieldNames.some(name => 
        cleanAttr === name.replace(/[^a-zA-Z0-9]+/g, '') || 
        cleanAttr.includes(name.replace(/[^a-zA-Z0-9]+/g, ''))
      )) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if field is a search field
   * @param {HTMLElement} field - The field to check
   * @returns {boolean} True if field is a search field
   */
  isSearchField(field) {
    const values = [field.type, field.name, field.id, field.placeholder].filter(Boolean);
    
    for (const value of values) {
      const words = value.toLowerCase().replace(/([a-z])([A-Z])/g, '$1 $2').split(/[^a-z]/gi);
      if (words.some(word => this.searchFieldNames.has(word))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if field has disqualifying attribute values
   * @param {HTMLElement} field - The field to check
   * @returns {boolean} True if field should be excluded
   */
  hasDisqualifyingValue(field) {
    const values = [field.id, field.name, field.placeholder].filter(Boolean);
    
    for (const value of values) {
      const cleanValue = value.toLowerCase().replace(/[\s_-]/g, '');
      if (this.passwordFieldExcludeList.some(exclude => cleanValue.includes(exclude))) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets the label text for a field
   * @param {HTMLElement} field - The field to get label for
   * @returns {string} Label text or empty string
   */
  getFieldLabel(field) {
    // Check for associated label
    if (field.id) {
      const label = document.querySelector(`label[for="${field.id}"]`);
      if (label) return label.textContent || '';
    }

    // Check for parent label
    const parentLabel = field.closest('label');
    if (parentLabel) return parentLabel.textContent || '';

    return '';
  }

  /**
   * Gets the index of an element in the document
   * @param {HTMLElement} element - The element to get index for
   * @returns {number} Element index
   */
  getElementIndex(element) {
    const allElements = Array.from(document.querySelectorAll('*'));
    return allElements.indexOf(element);
  }

  /**
   * Finds the best username field for a given password field
   * @param {HTMLElement} passwordField - The password field
   * @param {Document} document - The document to search in
   * @returns {HTMLElement|null} The best matching username field
   */
  findUsernameForPassword(passwordField, document = window.document) {
    const form = passwordField.closest('form');
    const candidates = this.detectUsernameFields(document, passwordField);
    
    // Filter candidates to same form if form exists
    const filteredCandidates = form ? 
      candidates.filter(field => field.closest('form') === form) : 
      candidates;

    // Return the closest preceding username field
    return filteredCandidates.length > 0 ? filteredCandidates[filteredCandidates.length - 1] : null;
  }

  /**
   * Gets all login form data from the document
   * @param {Document} document - The document to analyze
   * @returns {Object[]} Array of form data objects
   */
  getLoginForms(document = window.document) {
    const passwordFields = this.detectPasswordFields(document);
    const forms = [];

    for (const passwordField of passwordFields) {
      const usernameField = this.findUsernameForPassword(passwordField, document);
      const form = passwordField.closest('form');
      
      forms.push({
        form: form,
        passwordField: passwordField,
        usernameField: usernameField,
        formAction: form ? form.action : null,
        formMethod: form ? form.method : null
      });
    }

    return forms;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FieldDetector;
}

// Make available globally if in browser
if (typeof window !== 'undefined') {
  window.FieldDetector = FieldDetector;
}



