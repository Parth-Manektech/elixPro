import React, { useRef } from 'react'
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { AlertIcon } from '../../../Assets/SVGs';

function GeneradaJSON() {
    const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm();
    function onSubmit(data) {
        console.log('data', data);

    }
    const JsonInputRef = useRef(null);
    const JsInputRef = useRef(null);
    const JavaInputRef = useRef(null);

    const handleFileChange = (e, onChange, fileType) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setValue(fileType, event.target.result);
            };
            reader.readAsText(file);
            onChange(file);
        }
    };



    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Row className='ms-1 mb-4 text-secondary'>Compila i seguenti campi per generare l’Excel del nuovo Procedimento.</Row>
            <Row lg={12}>
                <Col lg={4}>
                    mappaturaRuoliAzioniListe.json
                </Col>
                <Col lg={4}>
                    <Controller
                        name='jsonFile'
                        control={control}
                        rules={{ required: 'È richiesta la procedura TAG' }}
                        render={({ field: { onChange, ref, value } }) => (
                            <div className='coustomFileInputFile cursor-pointer' onClick={() => JsonInputRef.current.click()}>
                                <Form.Control
                                    ref={JsonInputRef}
                                    type='file'
                                    placeholder='es. PPT'
                                    className='d-none'
                                    accept='.json'
                                    onChange={(e) => {
                                        handleFileChange(e, onChange, 'sJsonPreview');
                                    }}
                                />
                                <Button className='InputFileBtn' >
                                    Sfoglia...</Button>
                                <span className="ms-2 InputFiletext text-secondary">{watch('jsonFile') ? watch('jsonFile')?.name : 'mappaturaRuoliAzioniListe.json'}</span>
                            </div>
                        )}
                    />
                    {errors.jsonFile && (
                        <small className="text-danger">{errors.jsonFile.message}</small>
                    )}
                </Col>
            </Row>

            <Row lg={12} className='mt-4'>
                <Col lg={4}>
                </Col>
                <Col lg={8}>
                    <Controller
                        name='sJsonPreview'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Form.Control
                                as="textarea"
                                rows={4}
                                className='form-control'
                                value={value || ''}
                                readOnly
                            />)}
                    />
                </Col>
            </Row>

            {/* Properties.js File Input */}
            <Row lg={12} className='mt-4'>
                <Col lg={4}>properties.js</Col>
                <Col lg={4}>
                    <Controller
                        name='jsFile'
                        control={control}
                        render={({ field: { onChange } }) => (
                            <div className='coustomFileInputFile cursor-pointer' onClick={() => JsInputRef.current.click()}>
                                <Form.Control
                                    ref={JsInputRef}
                                    type='file'
                                    accept='.js'
                                    className='d-none'
                                    onChange={(e) => handleFileChange(e, onChange, "sJsPreview")}
                                />
                                <Button className='InputFileBtn' >Sfoglia...</Button>
                                <span className="ms-2 InputFiletext text-secondary">{watch('jsFile')?.name || 'properties.js'}</span>
                            </div>
                        )}
                    />
                </Col>
            </Row>
            <Row lg={12} className='mt-4'>
                <Col lg={4}>
                </Col>
                <Col lg={8} >
                    <Controller
                        name='sJsPreview'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Form.Control as="textarea" rows={4} readOnly className='form-control'
                                value={value || ''} />
                        )}
                    />
                </Col>
            </Row>


            {/* Properties.js File Input */}
            <Row lg={12} className='mt-4'>
                <Col lg={4}>workflow.java</Col>
                <Col lg={4}>
                    <Controller
                        name='javaFile'
                        control={control}
                        render={({ field: { onChange } }) => (
                            <div className='coustomFileInputFile cursor-pointer' onClick={() => JavaInputRef.current.click()}>
                                <Form.Control
                                    ref={JavaInputRef}
                                    type='file'
                                    accept='.java'
                                    className='d-none'
                                    onChange={(e) => handleFileChange(e, onChange, "sJavaPreview")}
                                />
                                <Button className='InputFileBtn' >Sfoglia...</Button>
                                <span className="ms-2 InputFiletext text-secondary">{watch('javaFile')?.name || 'workflow.java'}</span>
                            </div>
                        )}
                    />
                </Col>
            </Row>
            <Row lg={12} className='mt-4'>
                <Col lg={4}>
                </Col>
                <Col lg={8} >
                    <Controller
                        name='sJavaPreview'
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <Form.Control as="textarea" rows={4} readOnly className='form-control'
                                value={value || ''} />
                        )}
                    />
                </Col>
            </Row>


            <Row lg={12} className='mt-4'>
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
                            onChange={(e) => { onChange(e) }}
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
            <Alert className='mt-4 d-flex align-items-center' key='danger' variant='danger'>
                <AlertIcon width={20} height={20} />&nbsp;Si è verificato un errore. Verifica la correttezza dei files caricati e riprova.
            </Alert>
            <Modal.Footer>
                <Button variant="primary" type='submit'>Crea Procedimento</Button>
            </Modal.Footer>
        </form>
    )
}

export default GeneradaJSON