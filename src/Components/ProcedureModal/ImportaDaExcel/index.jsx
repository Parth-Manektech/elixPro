import React, { useRef } from 'react'
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { AlertIcon, InboxIcon, XlsFileIcon } from '../../../Assets/SVGs';

function ImportaDaExcel() {
    const { control, handleSubmit, formState: { errors }, watch } = useForm();
    function onSubmit(data) {
        console.log('data', data);

    }
    const ExcelInputRef = useRef(null);


    return (
        <form onSubmit={handleSubmit(onSubmit)}>

            <Row className='ms-1 mb-4 text-secondary'>Compila i seguenti campi per generare l’Excel del nuovo Procedimento.</Row>

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

            <Row lg={12} className='mt-4'>
                <Col lg={4}>
                    File Excel
                </Col>
                <Col lg={8}>
                    <Controller
                        name='excelFile'
                        control={control}
                        render={({ field: { onChange, } }) => (
                            <div className='coustomExcelInputFile cursor-pointer' onClick={() => ExcelInputRef.current.click()}>
                                <Form.Control
                                    ref={ExcelInputRef}
                                    type='file'
                                    placeholder='es. PPT'
                                    className='d-none'
                                    accept='.xls'
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        onChange(file);
                                    }}
                                />
                                <span className='mt-3 mb-2'><InboxIcon width={50} height={50} /></span>
                                <span className='mt-2 text-dark'>Clicca o trascina il file in questo box</span>
                                <span className='mt-1 mb-3 text-secondary'>Formato supportato: XLS. Dimensione massima 2MB.</span>
                            </div>
                        )}
                    />
                    <span className="text-primary">{watch('excelFile')?.name && <XlsFileIcon />}{watch('excelFile')?.name || ''}</span>
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

export default ImportaDaExcel