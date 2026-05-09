import React from "react";
import { Eye, EyeOff } from "lucide-react";
import PropTypes from "prop-types";

/**
 * Controlled input with optional label, error state, leading/trailing icon
 * and password-visibility toggle.
 */
const InputField = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  isPasswordShown,
  togglePasswordVisibility,
  error,
  icon,
  iconPosition = "left",
  className = "",
  required = false,
  minLength = null,
  maxLength = null,
  pattern = null,
  maxSize = null,
  maxFiles = null,
  onError,
  ...props
}) => {
  /* -------------------------------------------------------------------------- */
  /*                       Safe string conversion for value                      */
  /* -------------------------------------------------------------------------- */
  const stringValue =
    value == null
      ? ""
      : typeof value === "number"
        ? value.toString()
        : String(value);

  /* -------------------------------------------------------------------------- */
  /*                              Computed classes                              */
  /* -------------------------------------------------------------------------- */
  const shouldShowPasswordToggle =
    typeof togglePasswordVisibility === "function" &&
    (type === "password" || isPasswordShown);

  const inputClasses = `
    w-full h-11 rounded-lg border-2 bg-white
    ${error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500"}
    focus:ring-2 focus:ring-teal-100 outline-none transition-all duration-200 text-gray-800
    ${icon && iconPosition === "left" ? "pl-10" : "pl-4"}
    ${
      shouldShowPasswordToggle || (icon && iconPosition === "right")
        ? "pr-10"
        : "pr-4"
    }
    ${className}
  `
    .replace(/\s+/g, " ")
    .trim();

  const sanitizeValueForType = (raw, fieldType) => {
    if (fieldType === "text") {
      return raw.replace(/\d/g, "");
    }
    if (fieldType === "number" || fieldType === "tel") {
      let s = raw.replace(/[^\d.-]/g, "");
      const neg = s.startsWith("-");
      s = s.replace(/-/g, "");
      const i = s.indexOf(".");
      if (i === -1) return (neg ? "-" : "") + s;
      const intPart = s.slice(0, i);
      const fracPart = s.slice(i + 1).replace(/\./g, "");
      return (neg ? "-" : "") + intPart + "." + fracPart;
    }
    return raw;
  };

  /* -------------------------------------------------------------------------- */
  /*                          File-input helpers                                 */
  /* -------------------------------------------------------------------------- */
  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isAcceptableType = (file, accept) => {
    if (!accept) return true;
    const tokens = accept
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (tokens.length === 0) return true;
    const fileType = (file.type || "").toLowerCase();
    const fileName = (file.name || "").toLowerCase();
    return tokens.some((tok) => {
      if (tok.startsWith(".")) return fileName.endsWith(tok);
      if (tok.endsWith("/*")) return fileType.startsWith(tok.slice(0, -1));
      return fileType === tok;
    });
  };

  const reportError = (code, message, file) => {
    if (typeof onError !== "function") return;
    const err = new Error(message);
    err.code = code;
    if (file) err.file = file;
    onError(err);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (maxFiles != null && files.length > maxFiles) {
      e.target.value = "";
      reportError(
        "TOO_MANY_FILES",
        `You can only upload up to ${maxFiles} file${maxFiles === 1 ? "" : "s"}.`,
      );
      return;
    }

    for (const file of files) {
      if (!isAcceptableType(file, props.accept)) {
        e.target.value = "";
        reportError(
          "INVALID_TYPE",
          `"${file.name}" is not an accepted file type.`,
          file,
        );
        return;
      }
      if (maxSize != null && file.size > maxSize) {
        e.target.value = "";
        reportError(
          "FILE_TOO_LARGE",
          `"${file.name}" is too large. Max size is ${formatBytes(maxSize)}.`,
          file,
        );
        return;
      }
    }

    if (typeof onChange === "function") onChange(e);
  };

  const handleChange = (e) => {
    if (type === "file") return handleFileChange(e);
    if (typeof onChange !== "function") return;
    const raw = e.target.value;
    const next =
      type === "text" || type === "number" || type === "tel"
        ? sanitizeValueForType(raw, type)
        : raw;
    if (next === raw) {
      onChange(e);
      return;
    }
    onChange({
      ...e,
      target: { ...e.target, value: next },
      currentTarget: { ...e.currentTarget, value: next },
    });
  };

  /* -------------------------------------------------------------------------- */
  /*                                 JSX return                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-gray-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Leading icon */}
        {icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input element */}
        <input
          id={id}
          name={props.name ?? id}
          type={type === "password" && isPasswordShown ? "text" : type}
          placeholder={placeholder}
          {...(type !== "file" ? { value: stringValue } : {})}
          onChange={handleChange}
          className={inputClasses}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          {...props}
        />

        {/* Trailing icon (non-password) */}
        {icon && iconPosition === "right" && !togglePasswordVisibility && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        {/* Password visibility toggle */}
        {shouldShowPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-teal-600 transition-colors duration-200"
            aria-label={isPasswordShown ? "Hide password" : "Show password"}
          >
            {isPasswordShown ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center mt-1.5">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                               PropTypes                                    */
/* -------------------------------------------------------------------------- */
InputField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  isPasswordShown: PropTypes.bool,
  togglePasswordVisibility: PropTypes.func,
  error: PropTypes.string,
  /** Icon must be a ready-to-render element, e.g. <Mail className="w-5 h-5" /> */
  icon: PropTypes.element,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  className: PropTypes.string,
  required: PropTypes.bool,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  pattern: PropTypes.string,
  /** For type="file": maximum bytes per file. */
  maxSize: PropTypes.number,
  /** For type="file": maximum number of files allowed. */
  maxFiles: PropTypes.number,
  /**
   * For type="file": invoked with an Error when validation fails.
   * The error has `.code` (TOO_MANY_FILES | INVALID_TYPE | FILE_TOO_LARGE)
   * and `.file` (the offending File, when applicable).
   */
  onError: PropTypes.func,
};

InputField.defaultProps = {
  type: "text",
  iconPosition: "left",
};

export default InputField;
