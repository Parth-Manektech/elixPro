import React, { useRef, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { InboxIcon, XlsFileIcon } from '../../../Assets/SVGs';
import { ErrorToast } from '../../../utils/Toster';
import Loader from '../../Loader';
import { useNavigate } from 'react-router-dom';


function ImportaDaExcel() {
    const { control, handleSubmit, formState: { errors }, watch } = useForm();
    const [isLoading, setisLoading] = useState(false);
    const navigate = useNavigate();


    function onSubmit(data) {
        setisLoading(true);
        localStorage.clear('ePWorkFlow');
        const formData = new FormData();
        formData.append("excelFile", data?.excelFile);
        try {
            fetch("http://efapi601.ext.ovh.anthesi.com:8080/elixPro/rest/generateJson", {
                method: "POST",
                body: formData,
            })
                .then((response) => {
                    if (!response.ok) {
                        setisLoading(false);
                        ErrorToast("Failed to process the Excel file.");
                        throw new Error("Failed to process the Excel file.");
                    }
                    return response.json();
                })
                .then((data) => {

                    setisLoading(false);
                    const stateData = {
                        from: "Nuovo + Importa da Excel",
                        isLoading: true,
                        ePWorkFlowJson: JSON.stringify(data?.ePWorkFlowJson)
                    }
                    navigate('/tutti-i-procedimenti/procedimento-x/editor', { state: stateData }, { replace: true })

                })
                .catch((error) => {
                    console.error(error);
                    ErrorToast("Something went wrong please check")
                    setisLoading(false)
                });
        } catch (e) {
            console.error('e', e);
            ErrorToast("Something went wrong please check")
            setisLoading(false)
        }

    }
    const ExcelInputRef = useRef(null);


    return (
        <>
            {isLoading && <div className='z-3 position-absolute top-0 start-0 w-100 h-100' style={{ background: '#00000075' }}> <Loader /></div>}
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

                {/* 
                <Alert className='mt-4 d-flex align-items-center' key='danger' variant='danger'>
                    <AlertIcon width={20} height={20} />&nbsp;Esiste già un Procedimento con questo TAG/nome.
                </Alert> */}
                <Modal.Footer>
                    <Button variant="primary" type='submit'>Crea Procedimento</Button>
                </Modal.Footer>
            </form>

        </>
    )
}

export default ImportaDaExcel