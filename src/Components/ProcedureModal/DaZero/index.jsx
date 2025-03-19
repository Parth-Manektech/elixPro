import React from 'react'
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { AlertIcon } from '../../../Assets/SVGs';

function DaZeroModalForm() {
    const { control, handleSubmit, formState: { errors }, } = useForm();

    function onSubmit(data) {
        console.log('data', data)
    }


    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Row lg={12}>
                <Col lg={4}>
                    TAG procedimento
                </Col>
                <Col lg={8}>
                    <Controller
                        name='sTagProcedimento'
                        control={control}
                        rules={{ required: 'È richiesta la procedura TAG' }}
                        render={({ field: { onChange, ref, value } }) => (<Form.Control
                            ref={ref}
                            type='text'
                            placeholder='es. PPT'
                            className='form-control'
                            onChange={(e) => onChange(e)}
                        />)}
                    />
                    {errors.sTagProcedimento && (
                        <small className="text-danger">{errors.sTagProcedimento.message}</small>
                    )}
                </Col>
            </Row>
            <Row lg={12} className='mt-4'>
                <Col lg={4}>
                    Nome procedimento
                </Col>
                <Col lg={8}>
                    <Controller
                        name='sNomeProcedimento'
                        control={control}
                        rules={{ required: 'È richiesta la procedura Nome' }}
                        render={({ field: { onChange, ref, value } }) => (<Form.Control
                            ref={ref}
                            type='text'
                            placeholder='es. Assegno Di Ricerca'
                            className='form-control'
                            onChange={(e) => onChange(e)}
                        />)}
                    />
                    {errors.sNomeProcedimento && (
                        <small className="text-danger">{errors.sNomeProcedimento.message}</small>
                    )}
                </Col>
            </Row>
            <Alert className='mt-4 d-flex align-items-center' key='danger' variant='danger'>
                <AlertIcon width={20} height={20} />&nbsp;Esiste già un Procedimento con questo TAG/nome.
            </Alert>
            <Modal.Footer>
                <Button variant="primary" type='submit'>Crea Procedimento</Button>
            </Modal.Footer>
        </form>
    )
}

export default DaZeroModalForm