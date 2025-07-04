import React, { useState, useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';

const CustomSelect = ({ options, control, errors, fieldName, placeholder, label, rules }) => {
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectOpen(false);
                setSearchTerm('');
                setFocusedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options?.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleKeyDown = (e, onChange) => {
        if (!isSelectOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => prev > -1 ? prev - 1 : prev);
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[focusedIndex], onChange);
                }
                break;
            case 'Escape':
                setIsSelectOpen(false);
                setSearchTerm('');
                setFocusedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleSelect = (option, onChange) => {
        onChange(option.label); // Update react-hook-form value
        setIsSelectOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
    };

    const clearSelection = (e, onChange) => {
        e.stopPropagation();
        onChange(''); // Clear react-hook-form value
        setSearchTerm('');
        setFocusedIndex(-1);
    };

    return (
        <Controller
            name={fieldName}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => (
                <div className="form-group">
                    <div className="row">
                        <div className="col-lg-3 d-flex justify-content-end align-items-start mt-2">
                            {label}
                        </div>
                        <div className="col-lg-9">
                            <div className="dropdown" ref={dropdownRef}>
                                <button
                                    className={`custom-autocomplete-input ${errors[fieldName] ? 'is-invalid' : ''}`}
                                    type="button"
                                    onClick={() => {
                                        setIsSelectOpen(!isSelectOpen);
                                        if (!isSelectOpen) inputRef.current?.focus();
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, onChange)}
                                >
                                    <span className="selected-option">
                                        {value || (
                                            <span style={{ color: "#565a5f" }}>
                                                {placeholder}
                                            </span>
                                        )}
                                    </span>
                                    <span className="dropdown-icons">
                                        {(value && isSelectOpen) && (
                                            <i
                                                className="bi bi-x-circle me-2"
                                                onClick={(e) => clearSelection(e, onChange)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        )}
                                        <i className={`bi bi-chevron-${isSelectOpen ? 'up' : 'down'}`}></i>
                                    </span>
                                </button>
                                {isSelectOpen && (
                                    <div
                                        className="dropdown-menu show"
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            className="form-control mb-2 autocomplete-inputSearch"
                                            placeholder="Cerca..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setFocusedIndex(-1);
                                            }}
                                            onKeyDown={handleKeyDown}
                                        />
                                        {filteredOptions.length > 0 ? (
                                            filteredOptions.map((option, index) => (
                                                <span
                                                    key={option.value}
                                                    className={`dropdown-item ${index === focusedIndex ? 'active' : ''}`}
                                                    onClick={() => handleSelect(option, onChange)}
                                                    onMouseEnter={() => setFocusedIndex(index)}
                                                >
                                                    {option.label}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="dropdown-item disabled">Nessun risultato</span>
                                        )}
                                    </div>
                                )}
                                {(!value && errors[fieldName]) && (
                                    <div className="invalid-feedback d-block">
                                        {errors[fieldName].message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        />
    );
};

export default CustomSelect;