import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { Col } from "react-bootstrap";

// Sortable Item Component for Role Cards
export const SortableRoleCard = ({ id, children, className, style }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const styleWithTransform = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition: transition || 'none',
    };

    return (
        <Col
            ref={setNodeRef}
            className={className}
            style={styleWithTransform}
            {...attributes}
            {...listeners}
        >
            {children}
        </Col>
    );
};


// Sortable Item Component for List/Action Items
export const SortableItem = ({ id, children, className, style, onMouseEnter, onMouseLeave, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const styleWithTransform = {
        ...style,
        transform: CSS.Transform.toString(transform),
        transition: transition || 'none',
        cursor: 'grab',
    };

    // Prevent drag events from interfering with click and hover
    const handleMouseDown = (e) => {
        e.stopPropagation();
        listeners?.onMouseDown?.(e);
    };

    return (
        <span
            ref={setNodeRef}
            className={className}
            style={styleWithTransform}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            {...attributes}
            {...listeners}
            onMouseDown={handleMouseDown}
        >
            {children}
        </span>
    );
};


export const initializeWorkflowMapping = (data) => {
    if (!data.some(item => item.hasOwnProperty('workflowmapping'))) {
        data.push({ workflowmapping: [] });
    }
    return data;
};



