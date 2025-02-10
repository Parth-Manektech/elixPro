import React, { useState } from 'react'
import { ArchiveIcon, CircleCheckIcon, CircleCross, DownArrowMenu, DownMenuIcon, GridIcon, InfoLight, ListIcon, PlusIcon, SearchIcon } from '../../Assets/SVGs'
import { Button, Form, Pagination } from 'react-bootstrap';
import useMediaQuery from '../../utils/customHooks/mediaQuery';


function HomeResearch() {
    const [selected, setSelected] = useState("tutti");
    const [view, setView] = useState("list");
    const isMobile = useMediaQuery('(max-width: 867px)');

    return (
        <div className={`home_research ${isMobile ? 'position-static' : 'position-sticky'} p-2 d-flex flex-column justify-content-center align-items-center gap-2`}>

            <div className={`w-100 d-flex ${isMobile ? 'flex-column gap-3' : 'flex-row gap-3'} justify-content-between align-items-center `}>

                <div className={`d-flex ${isMobile ? 'justify-content-between w-100 ' : ''} align-items-center gap-3 `}>
                    <div className="btn-group custom-btn-group" role="group">
                        <input
                            type="radio"
                            className="btn-check"
                            name="btnradio"
                            id="btnradio1"
                            autoComplete="off"
                            checked={selected === "tutti"}
                            onChange={() => setSelected("tutti")}
                        />
                        <label className={`btn btn-group-research ${selected === "tutti" ? "active" : ""}`} htmlFor="btnradio1">
                            Tutti
                        </label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="btnradio"
                            id="btnradio2"
                            autoComplete="off"
                            checked={selected === "definitivi"}
                            onChange={() => setSelected("definitivi")}
                        />
                        <label className="btn btn-group-research d-flex justify-content-center align-items-center gap-1 flex-nowrap" htmlFor="btnradio2">
                            <CircleCheckIcon height={17} width={17} fill="#6C757D" />
                            {!isMobile && 'Definitivi'}
                        </label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="btnradio"
                            id="btnradio3"
                            autoComplete="off"
                            checked={selected === "test"}
                            onChange={() => setSelected("test")}
                        />
                        <label className="btn btn-group-research d-flex justify-content-center align-items-center gap-1 flex-nowrap" htmlFor="btnradio3">
                            <InfoLight />
                            {!isMobile && 'Intest'}
                        </label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="btnradio"
                            id="btnradio4"
                            autoComplete="off"
                            checked={selected === "offline"}
                            onChange={() => setSelected("offline")}
                        />
                        <label className="btn btn-group-research d-flex justify-content-center align-items-center gap-1 flex-nowrap" htmlFor="btnradio4">
                            <CircleCross />
                            {!isMobile && 'Offline'}
                        </label>
                    </div>

                    <div className='btn-archive d-flex flex-nowrap cursor-pointer'>
                        <ArchiveIcon className='me-2' />
                        Archiviati
                    </div>
                </div>

                <div className={`Research_input d-flex ${isMobile ? 'justify-content-between w-100' : ''} align-items-center gap-3 flex-nowrap`}>
                    <div className="input-group">
                        <input type="text" className="form-control" placeholder="Cerca..." />
                        <span className="input-group-text" id="basic-addon1"><SearchIcon height={20} width={25} fill='#ffffff' /></span>
                    </div>
                </div>


                <div className={`d-flex ${isMobile ? 'justify-content-between w-100' : ''} align-items-center gap-3 flex-nowrap`}>
                    <span className='cursor-pointer'>
                        <DownMenuIcon />
                    </span>
                    <Button variant="primary" className='d-flex align-items-center gap-1' >
                        <PlusIcon height={20} width={20} fill='#fff' />
                        New
                    </Button>
                </div>

            </div>

            <div className={`w-100 d-flex ${isMobile ? 'flex-column gap-3' : 'flex-row'} justify-content-between align-items-center `}>

                <div className={`d-flex ${isMobile ? 'justify-content-between w-100' : ''} align-items-center gap-3 flex-nowrap`}>
                    <span className='d-flex justify-content-center align-items-center'><DownArrowMenu /></span>
                    <span className='text-nowrap'>Ordina per: </span>
                    <Form.Select aria-label="Default select example" className='Ordina_select'>
                        <option>Data di creazione più recente</option>
                        <option value="1">Ordine alfabetico (A-Z)</option>
                        <option value="2">Ordine alfabetico (Z-A)</option>
                        <option value="3">Data di creazione meno recente</option>
                        <option value="4">Data di pubblicazione</option>
                        <option value="5">Data di scadenza</option>
                        <option value="6">Numero giorni in pubblicazione </option>
                        <option value="7">Numero istanze in corso</option>
                        <option value="8">Numero istanze inoltrate</option>
                    </Form.Select>
                </div>

                <div className={`d-flex ${isMobile ? 'justify-content-between w-100' : ''} align-items-center gap-3 flex-nowrap`}>
                    <span>108 risultati</span>
                    <Pagination className='research_pagination'>
                        <Pagination.Prev />
                        <Pagination.Ellipsis />
                        <Pagination.Item active>{1}</Pagination.Item>
                        <Pagination.Item>{2}</Pagination.Item>
                        <Pagination.Item>{3}</Pagination.Item>
                        <Pagination.Item>{4}</Pagination.Item>
                        <Pagination.Item>{5}</Pagination.Item>
                        <Pagination.Item>{6}</Pagination.Item>
                        <Pagination.Item>{7}</Pagination.Item>
                        <Pagination.Item>{8}</Pagination.Item>
                        <Pagination.Ellipsis />
                        <Pagination.Next />
                    </Pagination>
                </div>


                <div className={`d-flex ${isMobile ? 'justify-content-end w-100' : ''} align-items-center gap-3 flex-nowrap`}>
                    <div className="btn-group custom-toggle-group" role="group">
                        <input
                            type="radio"
                            className="btn-check"
                            name="viewToggle"
                            id="listView"
                            autoComplete="off"
                            checked={view === "list"}
                            onChange={() => setView("list")}
                        />
                        <label className={`btn btn-toggle ${view === "list" ? "active" : ""}`} htmlFor="listView">
                            <ListIcon />
                            Lista
                        </label>

                        <input
                            type="radio"
                            className="btn-check"
                            name="viewToggle"
                            id="gridView"
                            autoComplete="off"
                            checked={view === "grid"}
                            onChange={() => setView("grid")}
                        />
                        <label className={`btn btn-toggle ${view === "grid" ? "active" : ""}`} htmlFor="gridView">
                            <GridIcon />
                            Galleria
                        </label>
                    </div>
                </div>
            </div>



        </div>
    )
}

export default HomeResearch