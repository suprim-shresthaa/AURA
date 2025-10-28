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
    const inputClasses = `
    w-full h-11 rounded-lg border-2 bg-white
    ${error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500"}
    focus:ring-2 focus:ring-teal-100 outline-none transition-all duration-200 text-gray-800
    ${icon && iconPosition === "left" ? "pl-10" : "pl-4"}
    ${(type === "password" && togglePasswordVisibility) ||
            (icon && iconPosition === "right")
            ? "pr-10"
            : "pr-4"
        }
    ${className}
  `.replace(/\s+/g, " ").trim();

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
                    type={
                        type === "password" && isPasswordShown ? "text" : type
                    }
                    placeholder={placeholder}
                    value={stringValue}
                    onChange={onChange}
                    className={inputClasses}
                    {...props}
                />

                {/* Trailing icon (non-password) */}
                {icon && iconPosition === "right" && !togglePasswordVisibility && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}

                {/* Password visibility toggle */}
                {type === "password" && togglePasswordVisibility && (
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
};

InputField.defaultProps = {
    type: "text",
    iconPosition: "left",
};

export default InputField;