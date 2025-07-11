import React, { useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { js as beautify } from 'js-beautify'
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Controller, useForm } from 'react-hook-form';
import { Button, Form, Nav } from 'react-bootstrap';
import Loader from '../../Components/Loader';
import ReaddataInput from '../../Components/editorComponents/Readdatainput';
import View from './view';
import { CopyIcon, DownloadIcon, FLowIcon, UploadIcon } from '../../Assets/SVGs';
import { ErrorToast, SuccessToast } from '../../utils/Toster';
import { useLocation, useNavigate } from 'react-router-dom';
import { customFormatSql } from '../../Components/editorComponents/ViewComponentUtility';

const Editor = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [epWorkflowjson, setEpWorkflowjson] = useState(null)
    const [activeKey, setActiveKey] = useState("code");
    const [isLoading, setisLoading] = useState(false)
    const [fileData, setFileData] = useState({
        json: null,
        java: null,
        js: null
    })
    const xlsref = useRef()
    const jsonref = useRef()

    const normaljsonref = useRef()
    const javaref = useRef()
    const jsref = useRef()

    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm();
    const { control: mainControl, handleSubmit: mainhandleSubmit, watch: mainWatch, reset: mainReset } = useForm();
    const KEY = 'ePWorkFlow';
    const HEARTBEAT_KEY = 'app_heartbeat';
    const TAB_COUNT_KEY = 'open_tab_count';
    const HEARTBEAT_INTERVAL = 1000; // 1 sec
    const EXPIRE_TIME = 3000;            // 2 seconds to detect full browser close

    useEffect(() => {
        // Increase tab count
        const increaseTabCount = () => {
            const count = parseInt(localStorage.getItem(TAB_COUNT_KEY) || '0', 10);
            localStorage.setItem(TAB_COUNT_KEY, (count + 1).toString());
        };

        // Decrease tab count
        const decreaseTabCount = () => {
            const count = parseInt(localStorage.getItem(TAB_COUNT_KEY) || '1', 10);
            const newCount = Math.max(0, count - 1);
            localStorage.setItem(TAB_COUNT_KEY, newCount.toString());
        };

        // Check if browser was closed
        const checkIfBrowserClosed = () => {
            const lastBeat = parseInt(localStorage.getItem(HEARTBEAT_KEY) || '0', 10);
            const now = Date.now();
            const tabCount = parseInt(localStorage.getItem(TAB_COUNT_KEY) || '0', 10);

            if (now - lastBeat > EXPIRE_TIME && tabCount === 0) {
                console.log('Browser was closed. Clearing data...');
                localStorage.removeItem(KEY);
            }
        };

        // Start heartbeat
        const heartbeatInterval = setInterval(() => {
            localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());
        }, HEARTBEAT_INTERVAL);

        // On load
        increaseTabCount();
        checkIfBrowserClosed();

        // On unload
        window.addEventListener('beforeunload', decreaseTabCount);

        return () => {
            clearInterval(heartbeatInterval);
            window.removeEventListener('beforeunload', decreaseTabCount);
        };
    }, []);

    useEffect(() => {
        const stateData = location.state;

        const LocalData = localStorage.getItem("ePWorkFlow")
        if (LocalData && LocalData !== "null" && LocalData !== null) {
            setActiveKey("view");
            setisLoading(true)
            processAllCodeSegment(LocalData)
        } else {
            if (stateData?.from === "Nuovo + Genera da JSON" || stateData?.from === "Nuovo + Importa da Excel") {
                console.log('state');
                setActiveKey("view");
                const Data = JSON.parse(stateData?.ePWorkFlowJson)
                setisLoading(stateData?.isLoading)
                processAllCodeSegment(Data)
            }
        }
        // eslint-disable-next-line
    }, [location])

    function onSubmit(data) {
        setisLoading(true)
        const formData = new FormData();
        formData.append("excelFile", data?.xlsFile);
        NewWorkFlow();
        try {
            fetch("http://efapi601.ext.ovh.anthesi.com:8080/elixPro/rest/generateJson", {
                method: "POST",
                body: formData,
            })
                .then((response) => {
                    if (!response.ok) {
                        setisLoading(false);
                        ErrorToast("Failed to process the Excel file.")
                        throw new Error("Failed to process the Excel file.");
                    }
                    return response.json();
                })
                .then((data) => {
                    setisLoading(true)
                    processAllCodeSegment(data?.ePWorkFlowJson)

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

    // http://efapi601.ext.ovh.anthesi.com:8080/
    // httppp://localllllhost:8080/

    const processAllCodeSegment = (ePWorkFlowJson) => {
        try {
            fetch("http://efapi601.ext.ovh.anthesi.com:8080/elixPro/rest/generateBaseCode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({ jsonInput: typeof ePWorkFlowJson !== 'string' ? JSON.stringify(ePWorkFlowJson) : ePWorkFlowJson }),
            })
                .then((response) => {
                    if (!response.ok) {
                        setisLoading(false)
                        const temp = response.json();
                        temp.then((data) => {
                            ErrorToast(data?.message || "Failed to process code segment.");
                            localStorage.clear('ePWorkFlow');
                        })
                        return false
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('data', data)
                    setisLoading(false)
                    const sData = {
                        Json: data?.jsonData,
                        configJavascript: data?.configJs,
                        notifyJavascript: data?.notifyJs,
                        Java: data?.workflowJavaCode,
                        sql: data?.sqlScript,
                        Azionienum: data?.ajAzioneEnum,
                        Statusenum: data?.ajStatoEnum,
                        Listaenum: data?.ajListaEnum,
                    }
                    if (typeof ePWorkFlowJson === 'string') {
                        fillData(sData, JSON.parse(ePWorkFlowJson));
                    } else {
                        fillData(sData, ePWorkFlowJson);
                    }
                })
                .catch((error) => {
                    setisLoading(false)
                    ErrorToast("Something went wrong please check")
                    console.error(error);
                });
        } catch (error) {
            // console.error('catch', error);
            console.log('error', error)
            ErrorToast("Something went wrong please check")
            setisLoading(false)
        }
    }

    const prettyFormat = (code, lang = 'js') => {
        if (!code) return '';

        if (lang === 'json') {
            // Use JSON.stringify directly for JSON with 4-space indentation
            try {
                const parsed = typeof code === 'string' ? JSON.parse(code) : code;
                return JSON.stringify(parsed, null, 4);
            } catch (error) {
                console.error(`JSON formatting failed: ${error.message}`);
                return String(code); // Fallback to raw string
            }
        }

        // Use js-beautify for JavaScript
        try {
            const codeStr = typeof code === 'string' ? code : JSON.stringify(code);
            return beautify(codeStr, { indent_size: 4, space_in_empty_paren: true });
        } catch (error) {
            console.error(`js-beautify failed for ${lang}: ${error.message}`);
            return String(code);
        }
    };

    const fillData = (sData, ePWorkFlowJson) => {

        const formatFallback = (code, type) => {
            if (!code) return '';
            try {
                return code
                    .split('\n')
                    .map((line) => `    ${line.trim()}`)
                    .join('\n');
            } catch (error) {
                console.error(`Fallback formatting failed for ${type}: ${error.message}`);
                return code;
            }
        };


        const FlowJson = JSON.stringify(ePWorkFlowJson);

        setEpWorkflowjson(FlowJson);
        localStorage.setItem("ePWorkFlow", FlowJson)
        const FinalNormalJson = prettyFormat(sData?.Json, 'json');
        const FinalconfigJSJson = prettyFormat(sData?.configJavascript, 'js');
        const FinalnotifyJSJson = prettyFormat(sData?.notifyJavascript, 'js');
        const FinalJavaJson = formatFallback(sData?.Java, 'java');
        const FinalSQLJson = sData?.sql
            ? (() => {
                try {
                    console.log('Raw SQL content:', sData.sql);
                    const formattedSql = customFormatSql(sData.sql);
                    console.log('Formatted SQL content:', formattedSql);
                    return formattedSql;
                } catch (error) {
                    console.error('SQL formatting failed:', error.message, 'SQL content:', sData.sql);
                    return formatFallback(sData.sql, 'sql'); // Fallback to unformatted SQL
                }
            })()
            : '';

        const FinalAEnumJson = formatFallback(sData?.Azionienum, 'enum');
        const FinalSEnumJson = formatFallback(sData?.Statusenum, 'enum');
        const FinalLEnumJson = formatFallback(sData?.Listaenum, 'enum');

        // Set formatted values in the form

        setValue('normalJsonPreview', FinalNormalJson);
        setValue('jsconfigPreview', FinalconfigJSJson);
        setValue('jsnotifyPreview', FinalnotifyJSJson);
        setValue('javaPreview', FinalJavaJson);
        setValue('sqlPreview', FinalSQLJson);

        setValue('Azionipriview', FinalAEnumJson);
        setValue('Statuspriview', FinalSEnumJson);
        setValue('ListEnumpriview', FinalLEnumJson);

        setActiveKey("view")

    }

    useEffect(() => {
        const FinalePWorkFlowJson = prettyFormat(epWorkflowjson, 'jsson');
        setValue('ePWorkFlowJSONPreview', FinalePWorkFlowJson);
        // localStorage.setItem("ePWorkFlow", epWorkflowjson)

        try {
            const parsedJson = typeof epWorkflowjson === 'string' ? JSON.parse(epWorkflowjson) : epWorkflowjson;
            const normalJson = JSON.stringify(parsedJson);
            localStorage.setItem("ePWorkFlow", normalJson);
        } catch (error) {
            console.error('Error converting JSON:', error);
        }
        // eslint-disable-next-line
    }, [epWorkflowjson])




    const SaveePWorkFlowJson = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const maindata = JSON.parse(watch('ePWorkFlowJSONPreview'));
        const fileBlob = new Blob([JSON.stringify(maindata, null, 2)], { type: 'application/json' });
        const fileURL = URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = 'epWorkflow.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
    };

    const SaveNormalJSON = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const maindata = JSON.parse(watch('normalJsonPreview'));
        const fileBlob = new Blob([JSON.stringify(maindata, null, 2)], { type: 'application/json' });
        const fileURL = URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = 'mappaturaRuoliAzioniListe.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
    }

    const DwonloadWorkFlowjava = (data) => {
        if (!data) return; // Exit if no data provided

        // Create a blob with the Java content
        const fileBlob = new Blob([data], { type: 'text/x-java-source' });
        const fileURL = URL.createObjectURL(fileBlob);

        // Create and trigger download
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = 'WorkFlow.java';
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
    }

    // Download config.js file
    const DownloadconfigJS = (data) => {
        if (!data) return; // Exit if no data provided

        // Create a blob with the JavaScript content
        const fileBlob = new Blob([data], { type: 'application/javascript' });
        const fileURL = URL.createObjectURL(fileBlob);

        // Create and trigger download
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = 'config.js';
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
    }

    // Download notifica.js file
    const DownloadNotificaJS = (data) => {
        if (!data) return; // Exit if no data provided

        // Create a blob with the JavaScript content
        const fileBlob = new Blob([data], { type: 'application/javascript' });
        const fileURL = URL.createObjectURL(fileBlob);

        // Create and trigger download
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = 'notifica.js';
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
    }

    const DownloadSQL = (data) => {
        if (!data) return;
        const fileBlob = new Blob([data], { type: 'text/sql' });
        const fileURL = URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = 'ruoloScript.sql';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
    }

    const DownloadEnum = (data, Filename) => {
        if (!data) return;
        const fileBlob = new Blob([data], { type: 'text/x-java-source' });
        const fileURL = URL.createObjectURL(fileBlob);
        const link = document.createElement('a');
        link.href = fileURL;
        link.download = Filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
    };

    const DownloadFile = () => {
        const temp = JSON.parse(watch('ePWorkFlowJSONPreview'))
        fetch("http://efapi601.ext.ovh.anthesi.com:8080/elixPro/rest/download/excel", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                jsonInput: JSON.stringify(temp)
            }),
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error("Failed to process code segment.");
                }
                return response.blob();
            })
            .then((data) => {
                if (data instanceof Blob) {
                    const downloadUrl = URL.createObjectURL(data);
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download = "RolesActionsLists.xls";
                    link.click();

                    URL.revokeObjectURL(downloadUrl);
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    const handleNormalJSONUplod = (data) => {
        setFileData({ ...fileData, json: data })
        if (!fileData?.java) {
            ErrorToast('Upload Workflow Java File')
        }
        if (!fileData?.js) {
            ErrorToast('Upload Properties js File')
        }
    }

    const handleJavaUpload = (data) => {
        setFileData({ ...fileData, java: data })
        if (!fileData?.json) {
            ErrorToast('Upload Normal JSON File')
        }
        if (!fileData?.js) {
            ErrorToast('Upload Properties js File')
        }
    }

    const handleJSUpload = (data) => {
        setFileData({ ...fileData, js: data })
        if (!fileData?.json) {
            ErrorToast('Upload Normal JSON File')
        }
        if (!fileData?.java) {
            ErrorToast('Upload Workflow Java File')
        }
    }

    useEffect(() => {
        if (fileData?.java && fileData?.json && fileData?.js) {
            NewWorkFlow();
            generateEPWorkflow(fileData?.json, fileData?.java, fileData?.js)
        }
        // eslint-disable-next-line
    }, [fileData])

    const handleCopyCode = (data) => {
        if (!data) return; // Exit if no data provided

        // Use navigator.clipboard API to copy text
        navigator.clipboard.writeText(data)

            .then(() => {
                // Optional: Show success message
                SuccessToast('copied to clipboard successfully', 2000);
                // You could also use your ErrorToast component for success feedback:
                // ErrorToast('Code copied to clipboard!', 'success');
            })
            .catch((err) => {
                console.error('Failed to copy code: ', err);
                // Optional: Show error message
                ErrorToast('Failed to copy code to clipboard');
            });
    };

    const generateEPWorkflow = (Json, Java, JS) => {
        setisLoading(true)
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
                    ErrorToast("Failed to process code segment.")
                    throw new Error("Failed to process code segment.");
                }
                return response.json();
            })
            .then((data) => {
                processAllCodeSegment(data?.ePWorkFlowJson);
            })
            .catch((error) => {
                console.error(error);
                ErrorToast("Something went wrong please check")
            });
    }

    const NewWorkFlow = () => {
        localStorage.clear('ePWorkFlow');
        navigate('/tutti-i-procedimenti/procedimento-x/editor', { replace: true });
    }
    const hendelGenrateCode = () => {
        setisLoading(true); NewWorkFlow(); processAllCodeSegment(JSON.parse(watch('ePWorkFlowJSONPreview')))
    }

    return (
        <div className='position-relative'>
            {isLoading && <div className='z-3 position-absolute top-0 w-100 h-100' style={{ background: '#00000075' }}> <Loader /></div>}
            <Tabs
                activeKey={activeKey}
                onSelect={(k) => setActiveKey(k)}
                id="uncontrolled-tab-example "
                className="Editor_Tab"
            >
                <Tab eventKey="code" title="CODE">
                    <main className="container mb-4">
                        <form onSubmit={mainhandleSubmit(onSubmit)} className="text-center mb-4">
                            <label htmlFor="excelFile" className="form-label fw-bold">Upload Excel File</label>
                            <div className="d-flex justify-content-center align-items-center flex-wrap gap-3">
                                <div className='d-flex justify-content-between align-items-center '>
                                    <Controller
                                        name='xlsFile'
                                        control={mainControl}
                                        rules={{ required: 'xls file is require' }}
                                        render={({ field: { onChange } }) => (
                                            <div className='coustomFileInputFile cursor-pointer ' onClick={() => xlsref.current.click()}>
                                                <Form.Control
                                                    ref={xlsref}
                                                    type='file'
                                                    placeholder='es. PPT'
                                                    className='d-none'
                                                    accept='.xls'
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        onChange(file);
                                                    }}
                                                />
                                                <Button className='InputFileBtn' >
                                                    Sfoglia...</Button>
                                                <span className="ms-2 InputFiletext text-secondary">{mainWatch('xlsFile') ? mainWatch('xlsFile')?.name : 'Upload excel file '}</span>
                                            </div>
                                        )}
                                    />
                                    {errors.xlsFile && (
                                        <small className="text-danger">{errors.xlsFile.message}</small>
                                    )}
                                </div>
                                <Button className="btn btn-primary w-auto me-2" type='submit'>Submit</Button>
                                <button className="btn btn-success" onClick={() => { NewWorkFlow(); window.location.reload() }}>
                                    New Workflow
                                </button>
                                {watch('ePWorkFlowJSONPreview') && <div className="btn btn-success" onClick={(e) => DownloadFile(e)}>
                                    Download Excel
                                </div>}
                            </div>
                        </form>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Tabs
                                defaultActiveKey="WrokflowJson"
                                id="fill-tab-example"
                                className="mb-3"
                                fill
                            >
                                <Tab eventKey="WrokflowJson" title="Workflow Json">
                                    <Tab.Container defaultActiveKey="ePWorkFlowJSON" id="uncontrolled-tab-example" className="mb-2">

                                        <Nav variant="pills" className="d-flex flex-row justify-content-between  flex-wrap subJsBtn">
                                            <div className='d-flex flex-row gap-3 '>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="ePWorkFlowJSON">ePWorkFlow JSON</Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="normaljson">Normal JSON</Nav.Link>
                                                </Nav.Item>
                                            </div>

                                            <Tab.Content>
                                                <Tab.Pane eventKey="ePWorkFlowJSON">
                                                    <div className='subUploadbtns'>
                                                        <div className='d-flex justify-content-between align-items-center '>
                                                            <Controller
                                                                name='UepWorkflowjson'
                                                                control={mainControl}
                                                                render={({ field: { onChange } }) => (
                                                                    <div className='coustomFileInputFile cursor-pointer ' onClick={() => jsonref.current.click()}>
                                                                        <Form.Control
                                                                            ref={jsonref}
                                                                            type='file'
                                                                            placeholder='es. PPT'
                                                                            className='d-none'
                                                                            accept='.json'
                                                                            onChange={(e) => {
                                                                                const file = e.target.files[0];
                                                                                onChange(file);

                                                                                if (file) {
                                                                                    const reader = new FileReader();
                                                                                    reader.onload = (event) => {
                                                                                        try {
                                                                                            setisLoading(true)

                                                                                            const jsonData = JSON.parse(event.target.result);
                                                                                            processAllCodeSegment(jsonData);
                                                                                            mainReset({ xlsFile: '' })
                                                                                        } catch (error) {
                                                                                            ErrorToast("Uploaded epWorkflowjson is not valid");
                                                                                            setisLoading(false);
                                                                                            console.error('Error parsing JSON:', error);
                                                                                        }
                                                                                    };
                                                                                    reader.readAsText(file);
                                                                                }
                                                                            }
                                                                            }
                                                                        />
                                                                        <Button variant="outline-secondary"><UploadIcon height={18} width={18} className='mb-1' />&nbsp; Upload epWorkflowjson</Button>
                                                                    </div>
                                                                )}
                                                            />
                                                        </div>
                                                        {<Button disabled={!watch('ePWorkFlowJSONPreview')} onClick={() => handleCopyCode(watch('ePWorkFlowJSONPreview'))} variant="outline-secondary"><CopyIcon height={18} width={18} className='mb-1' /> Copy </Button>}
                                                        {<Button disabled={!watch('ePWorkFlowJSONPreview')} onClick={(e) => SaveePWorkFlowJson(e)} variant="success"> <DownloadIcon height={18} width={18} className='mb-1' /> &nbsp;Download epWorkflowjson</Button>}
                                                    </div>
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="normaljson">
                                                    <div className='subUploadbtns'>
                                                        <div className='d-flex justify-content-between align-items-center '>
                                                            <Controller
                                                                name='UnormalJson'
                                                                control={mainControl}
                                                                render={({ field: { onChange } }) => (
                                                                    <div className='coustomFileInputFile cursor-pointer ' onClick={() => normaljsonref.current.click()}>
                                                                        <Form.Control
                                                                            ref={normaljsonref}
                                                                            type='file'
                                                                            placeholder='es. PPT'
                                                                            className='d-none'
                                                                            accept='.json'
                                                                            onChange={(e) => {
                                                                                const file = e.target.files[0];
                                                                                onChange(file);

                                                                                if (file) {
                                                                                    const reader = new FileReader();
                                                                                    reader.onload = (event) => {
                                                                                        try {
                                                                                            const NormaljsonData = JSON.parse(event.target.result);
                                                                                            handleNormalJSONUplod(NormaljsonData);
                                                                                            mainReset({ xlsFile: '' })
                                                                                        } catch (error) {
                                                                                            setisLoading(false);
                                                                                            ErrorToast("Uploaded Normaljson is not valid")
                                                                                            console.error('Error parsing Normal JSON:', error);
                                                                                        }
                                                                                    };
                                                                                    reader.readAsText(file);
                                                                                }
                                                                            }
                                                                            }
                                                                        />
                                                                        <Button variant="outline-secondary"><UploadIcon height={18} width={18} className='mb-1' />&nbsp; Upload Normal JSON</Button>
                                                                    </div>
                                                                )}
                                                            />
                                                        </div>
                                                        {<Button disabled={!watch('normalJsonPreview')} onClick={(e) => handleCopyCode(watch('normalJsonPreview'))} variant="outline-secondary"><CopyIcon height={18} width={18} className='mb-1' />Copy </Button>}
                                                        {<Button disabled={!watch('normalJsonPreview')} onClick={(e) => SaveNormalJSON(e)} variant="success"><DownloadIcon height={18} width={18} className='mb-1' /> &nbsp;Download Normal Json</Button>}
                                                    </div>
                                                </Tab.Pane>
                                            </Tab.Content>
                                        </Nav>

                                        <Tab.Content>
                                            <Tab.Pane eventKey="ePWorkFlowJSON">
                                                <ReaddataInput name='ePWorkFlowJSONPreview' control={control} /></Tab.Pane>
                                            <Tab.Pane eventKey="normaljson"><ReaddataInput name='normalJsonPreview' control={control} /></Tab.Pane>
                                        </Tab.Content>
                                    </Tab.Container>

                                </Tab>

                                <Tab eventKey="JavaCode" title="Java Code">
                                    <div className='d-flex gap-3 align-items-center justify-content-end subUploadItems'>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            <Controller
                                                name='Ujava'
                                                control={mainControl}
                                                render={({ field: { onChange } }) => (
                                                    <div className='coustomFileInputFile cursor-pointer ' onClick={() => javaref.current.click()}>
                                                        <Form.Control
                                                            ref={javaref}
                                                            type='file'
                                                            placeholder='es. PPT'
                                                            className='d-none'
                                                            accept='.java'
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                onChange(file);
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (event) => {
                                                                        try {
                                                                            const WorkflowData = event.target.result
                                                                            handleJavaUpload(WorkflowData);
                                                                            mainReset({ xlsFile: '' })
                                                                        } catch (error) {
                                                                            ErrorToast("Uploaded Workflow.java is not valid");
                                                                            console.error('Error parsing JAVA:', error);
                                                                        }
                                                                    };
                                                                    reader.readAsText(file);
                                                                }
                                                            }
                                                            }
                                                        />
                                                        <Button variant="outline-secondary"><UploadIcon height={18} width={18} className='mb-1' />&nbsp; Upload WorkFlow.java</Button>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        {<Button disabled={!watch('javaPreview')} onClick={() => handleCopyCode(watch('javaPreview'))} variant="outline-secondary"><CopyIcon height={18} width={18} className='mb-1' /> Copy </Button>}
                                        {<Button disabled={!watch('javaPreview')} onClick={(e) => DwonloadWorkFlowjava(watch('javaPreview'))} variant="success"><DownloadIcon height={18} width={18} className='mb-1' /> &nbsp;Download WorkFlow.java</Button>}
                                    </div>
                                    <ReaddataInput name='javaPreview' control={control} />
                                </Tab>

                                <Tab eventKey="JavaScriptCode" title="Properties JS">
                                    <div className='d-flex gap-3 align-items-center justify-content-end subUploadItems'>
                                        <div className='d-flex justify-content-between align-items-center '>
                                            <Controller
                                                name='UJS'
                                                control={mainControl}
                                                render={({ field: { onChange } }) => (
                                                    <div className='coustomFileInputFile cursor-pointer ' onClick={() => jsref.current.click()}>
                                                        <Form.Control
                                                            ref={jsref}
                                                            type='file'
                                                            placeholder='es. PPT'
                                                            className='d-none'
                                                            accept='.js'
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                onChange(file);

                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onload = (event) => {
                                                                        try {
                                                                            const JSData = event.target.result
                                                                            handleJSUpload(JSData);
                                                                            mainReset({ xlsFile: '' })
                                                                        } catch (error) {
                                                                            ErrorToast("Uploaded Properties JS is not valid")
                                                                            console.error('Error parsing Normal JSON:', error);
                                                                        }
                                                                    };
                                                                    reader.readAsText(file);
                                                                }
                                                            }
                                                            }
                                                        />
                                                        <Button variant="outline-secondary"><UploadIcon height={18} width={18} className='mb-1' />&nbsp; Upload Properties JS</Button>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        {<Button disabled={!watch('jsconfigPreview')} onClick={() => handleCopyCode(watch('jsconfigPreview'))} variant="outline-secondary"><CopyIcon height={18} width={18} className='mb-1' /> Copy Properties JS</Button>}
                                        {<Button disabled={!watch('jsconfigPreview')} onClick={() => DownloadconfigJS(watch('jsconfigPreview'))} variant="success"><DownloadIcon height={18} width={18} className='mb-1' /> &nbsp;Download Properties JS</Button>}
                                    </div>
                                    <ReaddataInput name='jsconfigPreview' control={control} />
                                </Tab>

                                <Tab eventKey="SQLScript" title="SQL Script">
                                    <div className='d-flex flex-row gap-3 justify-content-end flex-wrap subUploadItems '>
                                        {<Button disabled={!watch('sqlPreview')} onClick={() => handleCopyCode(watch('sqlPreview'))} variant="outline-secondary"><CopyIcon height={18} width={18} className='mb-1' />Copy SQL</Button>}
                                        {<Button disabled={!watch('sqlPreview')} onClick={() => DownloadSQL(watch('sqlPreview'))} variant="success"><DownloadIcon height={18} width={18} className='mb-1' /> &nbsp;Download SQL</Button>}
                                    </div>
                                    <ReaddataInput name='sqlPreview' control={control} />
                                </Tab>

                                <Tab eventKey="EnumValues" title="Enum Values">

                                    <Tab.Container defaultActiveKey="Azioni" id="uncontrolled-tab-example" className="mb-2">
                                        <Nav variant="pills" className="d-flex flex-row justify-content-between  flex-wrap subJsBtn">
                                            <div className='d-flex flex-row gap-3'>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="Azioni">Azioni</Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="Status">Status</Nav.Link>
                                                </Nav.Item>
                                                <Nav.Item>
                                                    <Nav.Link eventKey="ListEnum">List Enum</Nav.Link>
                                                </Nav.Item>
                                            </div>

                                            <Tab.Content>
                                                <Tab.Pane eventKey="Azioni">
                                                    <div className='subUploadbtns'>
                                                        {<Button disabled={!watch('Azionipriview')} onClick={() => handleCopyCode(watch('Azionipriview'))} variant="outline-secondary"><CopyIcon height={18} width={18} className='mb-1' /> Copy Azioni Enum</Button>}
                                                        {<Button disabled={!watch('Azionipriview')} onClick={() => DownloadEnum(watch('Azionipriview'), 'AzioniEnum.java')} variant="success"> <DownloadIcon height={18} width={18} className='mb-1' /> &nbsp;Download Azioni Enum</Button>}
                                                    </div>
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="Status">
                                                    <div className='subUploadbtns'>
                                                        {<Button disabled={!watch('Statuspriview')} onClick={() => handleCopyCode(watch('Statuspriview'))} variant="outline-secondary"><CopyIcon height={18} width={18} className='mb-1' /> Copy Status Enum</Button>}
                                                        {<Button disabled={!watch('Statuspriview')} onClick={() => DownloadEnum(watch('Statuspriview'), 'StatusEnum.java')} variant="success"> <DownloadIcon height={18} width={18} className='mb-1' /> &nbsp;Download Status Enum</Button>}
                                                    </div>
                                                </Tab.Pane>
                                                <Tab.Pane eventKey="ListEnum">
                                                    <div className='subUploadbtns'>
                                                        {<Button disabled={!watch('ListEnumpriview')} onClick={() => handleCopyCode(watch('ListEnumpriview'))} variant="outline-secondary"><CopyIcon height={18} width={18} className='mb-1' /> Copy List Enum</Button>}
                                                        {<Button disabled={!watch('ListEnumpriview')} onClick={() => DownloadEnum(watch('ListEnumpriview'), 'ListEnum.java')} variant="success"> <DownloadIcon height={18} width={18} className='mb-1' /> &nbsp;Download List Enum</Button>}
                                                    </div>
                                                </Tab.Pane>
                                            </Tab.Content>
                                        </Nav>

                                        <Tab.Content>
                                            <Tab.Pane eventKey="Azioni"><ReaddataInput name='Azionipriview' control={control} /></Tab.Pane>
                                            <Tab.Pane eventKey="Status"><ReaddataInput name='Statuspriview' control={control} /></Tab.Pane>
                                            <Tab.Pane eventKey="ListEnum"><ReaddataInput name='ListEnumpriview' control={control} /></Tab.Pane>
                                        </Tab.Content>
                                    </Tab.Container>
                                </Tab>

                            </Tabs>
                            <div className='d-flex justify-content-center w-100 mt-4 mb-5'>
                                {watch('ePWorkFlowJSONPreview') && <Button onClick={() => hendelGenrateCode()} variant="success"><FLowIcon height={20} fill='#fff' width={20} className='pb-1' /> Generate Code</Button>}
                            </div>
                        </form>
                    </main>
                </Tab>

                <Tab eventKey="view" title="VIEW">
                    <View epWorkflowjson={epWorkflowjson} setEpWorkflowjson={setEpWorkflowjson} hendelGenrateCode={hendelGenrateCode} activeKey={activeKey} />
                </Tab>
            </Tabs>

        </div>
    );
};

export default Editor;
