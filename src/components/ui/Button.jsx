import PropTypes from "prop-types";
import React from "react";

/**
 * Re-usable button with optional icon (left or right) and gradient variants.
 */
const Button = ({
    children,
    text,
    onClick,
    variant = "primary",
    className = "",
    icon,
    iconPosition = "left",
    ...props
}) => {
    /* -------------------------------------------------------------------------- */
    /*                                 Base styles                                 */
    /* -------------------------------------------------------------------------- */
    const baseStyles =
        "w-full font-medium transition-all duration-200 flex items-center justify-center h-10 text-base rounded-lg";

    const variantStyles = {
        primary:
            "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-500 text-white shadow-md hover:shadow-lg",
        secondary:
            "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow",
    };

    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${className}`;

    /* -------------------------------------------------------------------------- */
    /*                               Icon rendering                                */
    /* -------------------------------------------------------------------------- */
    const theIcon = React.useMemo(() => {
        if (!icon) return null;

        // If icon is already a React element (e.g., <Mail className="w-4 h-4" />)
        if (React.isValidElement(icon)) return icon;

        // If icon is a component function (e.g., Mail from lucide-react)
        if (typeof icon === "function") {
            // Instantiate with optional props (e.g., className for styling)
            const IconComponent = icon;
            return <IconComponent className="w-4 h-4" />;
        }

        return null;
    }, [icon]);

    /* -------------------------------------------------------------------------- */
    /*                               Content rendering                            */
    /* -------------------------------------------------------------------------- */
    const content = text ?? children ?? null;

    /* -------------------------------------------------------------------------- */
    /*                                 JSX return                                 */
    /* -------------------------------------------------------------------------- */
    return (
        <button
            className={combinedClassName}
            onClick={onClick}
            type="button"
            {...props}
        >
            {/* Left icon */}
            {iconPosition === "left" && theIcon && (
                <span className="mr-2 flex items-center">{theIcon}</span>
            )}

            {/* Main label */}
            {content}

            {/* Right icon */}
            {iconPosition === "right" && theIcon && (
                <span className="ml-2 flex items-center">{theIcon}</span>
            )}
        </button>
    );
};

/* -------------------------------------------------------------------------- */
/*                               PropTypes                                    */
/* -------------------------------------------------------------------------- */
Button.propTypes = {
    children: PropTypes.node,
    text: PropTypes.string,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(["primary", "secondary"]),
    className: PropTypes.string,
    /** A ready-to-render element (<Mail />) or a component function (Mail) */
    icon: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    iconPosition: PropTypes.oneOf(["left", "right"]),
};

Button.defaultProps = {
    variant: "primary",
    iconPosition: "left",
};

export default Button;