import React, { useRef, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
// import { AlertIcon } from '../../../Assets/SVGs';
import { ErrorToast } from '../../../utils/Toster';
import { useNavigate } from 'react-router-dom';
import Loader from '../../Loader';

function GeneradaJSON() {
    const [isLoading, setisLoading] = useState(false)
    const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm();
    const navigate = useNavigate();
    const [fileData, setFileData] = useState({
        json: null,
        java: null,
        js: null
    })


    function onSubmit() {
        if (fileData?.java && fileData?.json && fileData?.js) {
            setisLoading(true)
            generateEPWorkflow(fileData?.json, fileData?.java, fileData?.js);
        }

    }
    const generateEPWorkflow = (Json, Java, JS) => {
        fetch("http://efapi601.ext.ovh.anthesi.com:8080/elixPro/rest/generate/configToWorkflowJson", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                jsonInput: JSON.stringify(Json),
                workflowJava: Java,
                configJs: JS,
                notificaJs: JS
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    setisLoading(false);
                    ErrorToast("Failed to process code segment.")
                    throw new Error("Failed to process code segment.");
                }
                return response.json();
            })
            .then((data) => {
                setisLoading(false);
                const stateData = {
                    from: "Nuovo + Genera da JSON",
                    isLoading: true,
                    ePWorkFlowJson: JSON.stringify(data?.ePWorkFlowJson)
                }
                navigate('/tutti-i-procedimenti/procedimento-x/editor', { state: stateData })

            })
            .catch((error) => {
                setisLoading(false);
                console.error(error);
                ErrorToast("Something went wrong please check")
            });
    }

    const JsonInputRef = useRef(null);
    const JsInputRef = useRef(null);
    const JavaInputRef = useRef(null);




    return (
        <>
            {isLoading && <div className='z-3 position-absolute top-0 start-0 w-100 h-100' style={{ background: '#00000075' }}> <Loader /></div>}
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
                                            // handleFileChange(e, onChange, 'sJsonPreview');
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    try {
                                                        const NormaljsonData = JSON.parse(event.target.result);
                                                        setFileData({ ...fileData, json: NormaljsonData })
                                                        setValue('sJsonPreview', event.target.result);
                                                    } catch (error) {
                                                        ErrorToast("Uploaded json file is not valid")
                                                        console.error('Error parsing Normal JSON:', error);
                                                    }
                                                };
                                                reader.readAsText(file);
                                                onChange(file);
                                            }
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
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    try {
                                                        const propertyJs = event.target.result
                                                        setFileData({ ...fileData, js: propertyJs })
                                                        setValue('sJsPreview', event.target.result);
                                                    } catch (error) {
                                                        ErrorToast("Uploaded js file is not valid")
                                                        console.error('Error parsing JS:', error);
                                                    }
                                                };
                                                reader.readAsText(file);
                                                onChange(file);
                                            }
                                        }}
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
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    try {
                                                        const workflowJava = event.target.result
                                                        setFileData({ ...fileData, java: workflowJava })
                                                        setValue('sJavaPreview', event.target.result);
                                                    } catch (error) {
                                                        ErrorToast("Uploaded java file is not valid")
                                                        console.error('Error parsing java:', error);
                                                    }
                                                };
                                                reader.readAsText(file);
                                                onChange(file);
                                            }
                                        }}
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

                {/* <Alert className='mt-4 d-flex align-items-center' key='danger' variant='danger'>
                <AlertIcon width={20} height={20} />&nbsp;Esiste già un Procedimento con questo TAG/nome.
            </Alert>
            <Alert className='mt-4 d-flex align-items-center' key='danger' variant='danger'>
                <AlertIcon width={20} height={20} />&nbsp;Si è verificato un errore. Verifica la correttezza dei files caricati e riprova.
            </Alert> */}
                <Modal.Footer>
                    <Button variant="primary" type='submit'>Crea Procedimento</Button>
                </Modal.Footer>
            </form>
        </>
    )
}

export default GeneradaJSON