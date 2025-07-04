import React, { useState, useEffect, useRef } from 'react';
import { Controller } from 'react-hook-form';

const CustomMultiSelect = ({ options, control, errors, fieldName, placeholder, label, rules }) => {
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

    const handleKeyDown = (value, onChange) => (e) => {
        if (!isSelectOpen) return;

        const filteredOptions = options.filter(
            option =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !(Array.isArray(value) && value.includes(option.label))
        );

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
                    handleSelect(filteredOptions[focusedIndex], value, onChange);
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

    const handleSelect = (option, value, onChange) => {
        const newValue = Array.isArray(value) ? [...value, option.label] : [option.label];
        onChange(newValue); // Update react-hook-form value with array
        setSearchTerm('');
        setFocusedIndex(-1);
        inputRef.current?.focus(); // Keep dropdown open and focus on input
    };

    const clearSelection = (e, onChange) => {
        e.stopPropagation();
        onChange([]); // Clear all selections
        setSearchTerm('');
        setFocusedIndex(-1);
    };

    const removeOption = (optionToRemove, value, onChange) => (e) => {
        e.stopPropagation();
        const newValue = value.filter(item => item !== optionToRemove);
        onChange(newValue); // Update react-hook-form with updated array
    };

    return (
        <Controller
            name={fieldName}
            control={control}
            rules={rules}
            render={({ field: { onChange, value } }) => {
                // Compute filteredOptions inside render where value is available
                const filteredOptions = options?.filter(
                    option =>
                        option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        !(Array.isArray(value) && value.includes(option.label))
                );

                return (
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
                                        onKeyDown={handleKeyDown(value, onChange)}
                                    >
                                        <span className="selected-option d-flex flex-wrap gap-2">
                                            {Array.isArray(value) && value.length > 0 ? (
                                                value.map((item, index) => (
                                                    <span
                                                        key={index}
                                                        className="d-flex align-items-center gap-1"
                                                        style={{ cursor: 'pointer', color: "#212529", backgroundColor: "#e9ecef", fontSize: '1rem', borderRadius: "0.2rem", padding: "0.1rem 0.4rem" }}
                                                    >
                                                        {item}
                                                        <i
                                                            className="bi bi-x ms-1 pt-1"
                                                            onClick={removeOption(item, value, onChange)}
                                                        />
                                                    </span>
                                                ))
                                            ) : (
                                                <span style={{ color: '#565a5f' }}>{placeholder}</span>
                                            )}
                                        </span>
                                        <span className="dropdown-icons">
                                            {Array.isArray(value) && value.length > 0 && (
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
                                                overflowY: 'auto',
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
                                                onKeyDown={handleKeyDown(value, onChange)}
                                            />
                                            {filteredOptions.length > 0 ? (
                                                filteredOptions.map((option, index) => (
                                                    <span
                                                        key={option.value}
                                                        className={`dropdown-item ${index === focusedIndex ? 'active' : ''}`}
                                                        onClick={() => handleSelect(option, value, onChange)}
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
                                    {errors[fieldName] && (
                                        <div className="invalid-feedback d-block">
                                            {errors[fieldName].message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }}
        />
    );
};

export default CustomMultiSelect;