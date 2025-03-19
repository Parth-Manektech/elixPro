import React from 'react'
import { Form, Row } from 'react-bootstrap'
import { Controller } from 'react-hook-form'

function ReaddataInput({ name, control, }) {
    return (
        <>
            <Row lg={12} className='d-flex justify-content-center align-items-center mt-4 ' >
                <Controller
                    name={name}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                        <Form.Control
                            as="textarea"
                            rows={10}
                            className='form-control codePreviewinput'
                            value={value || ''}
                            onChange={onChange}
                        />)}
                />
            </Row>
        </>
    )
}

export default ReaddataInput