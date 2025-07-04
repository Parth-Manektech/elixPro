import React, { useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { CircleMinus, Circleplus, DownBar, SettingIcon } from '../../../Assets/SVGs';

function Toolbar({ openRoleModal, setZoomLevel, MainData, visibleRoles, setVisibleRoles, isEditMode, setIsEditMode, hendelGenrateCode }) {
    const [zoomCount, setZoomCount] = useState(1)

    function Zoomin(e) {
        e.preventDefault();
        e.stopPropagation();

        if (zoomCount < 1) {
            const zValue = zoomCount + 0.1;
            setZoomCount(parseFloat(zValue.toFixed(10)));
            setZoomLevel(parseFloat(zValue.toFixed(10)));
        }
    }
    function Zoomout(e) {
        e.preventDefault();
        e.stopPropagation();

        if (zoomCount > 0.5) {
            const zValue = zoomCount - 0.1;
            setZoomCount(parseFloat(zValue.toFixed(10)));
            setZoomLevel(parseFloat(zValue.toFixed(10)));
        }
    }
    return (
        <div className="toolbar d-flex justify-content-between align-items-center">
            <div className='d-flex justify-content-center gap-3'>
                <Button
                    disabled={!isEditMode}
                    className="d-flex justify-content-center rounded cursor-pointer px-3 py-1"
                    variant="dark"
                    onClick={openRoleModal}
                >
                    Nuovo ruolo
                </Button>

                <Dropdown>
                    <Dropdown.Toggle variant="light" id="filter-roles" className="no-caret">
                        <DownBar width={15} height={15} /> Filtra
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <div className='d-flex justify-content-between align-items-center px-3 py-2'>
                            <span>Ruoli</span>
                            <span
                                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                                className='onswitchtext'
                                onClick={() => {
                                    const allVisible = Object.values(visibleRoles).every(Boolean);
                                    const updatedRoles = {};
                                    MainData.forEach((element) => {
                                        if (element.ruolo?.nome) {
                                            updatedRoles[element.ruolo.nome] = !allVisible;
                                        }
                                    });
                                    setVisibleRoles(updatedRoles);
                                }}
                            >
                                {
                                    Object.values(visibleRoles).every(Boolean)
                                        ? "Deseleziona tutti"
                                        : "Seleziona tutti"
                                }
                            </span>
                        </div>

                        {MainData.map((element) =>
                            element.ruolo?.nome && (
                                <Dropdown.Item
                                    key={element.ruolo.nome}
                                    as="div"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ display: 'flex', alignItems: 'center', padding: '5px 10px' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={visibleRoles[element.ruolo.nome] ?? true}
                                        onChange={() =>
                                            setVisibleRoles((prev) => ({
                                                ...prev,
                                                [element.ruolo.nome]: !prev[element.ruolo.nome],
                                            }))
                                        }
                                        style={{ marginRight: '8px' }}
                                    />
                                    {element.ruolo.nome}
                                </Dropdown.Item>
                            )
                        )}
                    </Dropdown.Menu>
                </Dropdown>

            </div>

            <div className='d-flex justify-content-center gap-3'>
                <span className={!isEditMode && "onswitchtext"}>
                    Display mode
                </span>
                <Form.Check // prettier-ignore
                    type="switch"
                    id="custom-switch"
                    className="large-switch"
                    onClick={(e) => {
                        setIsEditMode(e.target.checked);
                    }}
                />
                <span className={isEditMode && "onswitchtext"}>
                    Edit mode
                </span>
            </div>

            <div className='d-flex align-items-center gap-3'>
                <span className='d-flex align-items-center gap-2'>
                    <CircleMinus onClick={(e) => Zoomout(e)} className="cursor-pointer select-none " fill="#000" height={20} width={20} />
                    <span className='border border-dark py-1 px-2 select-none' >{`${zoomCount * 100}%`}</span>
                    <Circleplus onClick={(e) => Zoomin(e)} className="cursor-pointer select-none " height={20} width={20} />
                </span>
                <span className='cursor-pointer'>
                    <SettingIcon height={22} width={22} />
                </span>
                <span >
                    <Button variant="primary" onClick={() => hendelGenrateCode()} disabled={!isEditMode}>Salva</Button>
                </span>
            </div>



        </div>
    );
}

export default Toolbar;