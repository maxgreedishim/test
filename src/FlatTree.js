import { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const FlatTree = ({ companyId, company }) => {
    const [flats, setFlats] = useState([]);
    const [apartment, setApartment] = useState(null);
    const [activeFlatId, setActiveFlatId] = useState(null);
    const [activeApartmentId, setActiveApartmentId] = useState(null);
    const [clients, setClients] = useState([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [modalIsOpen, setIsOpen] = useState(false);


    useEffect(() => {
        const fetchFlats = async () => {
            try {
                const response = await axios.get(`https://dispex.org/api/vtest/Request/houses/${companyId}`);
                console.log('Список домов загружен', response.data);
                setFlats(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке списка квартир', error);
            }
        };
        fetchFlats().then();
    }, [companyId]);

    const getApartment = (flatId) => {
        const fetchApartmentData = async () => {
            try {
                const response = await axios.get(`https://dispex.org/api/vtest/Request/house_flats/${flatId}`);
                console.log('Данные квартиры получены', response.data);
                const apartments = response.data.filter(apartment => apartment.typeName === 'Квартира');
                setApartment(apartments);
            } catch (error) {
                console.log('Ошибка при получении данных квартиры', error);
            }
        };
        fetchApartmentData().then();
    };

    const getClients = async (addressId) => {
        try {
            const response = await axios.get(`https://dispex.org/api/vtest/HousingStock/clients`, { params: { addressId } });
            console.log('Результат запроса получен: ', response.data);
            console.log('Весь ответ от сервера: ', response);

            const clientsData = response.data;

            if(response.status === 204){
                setClients([]);
            } else if(Array.isArray(clientsData)){
                setClients(clientsData);
            } else {
                console.error('Полученные данные не являются массивом', clientsData);
            }
        } catch (error) {
            console.log('Ошибка при получении списка клиентов', error);
        }
    };

    const modalStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };

    const addClient = async (name, phone, email) => {
        try {
            const clientData = {
                Name: name,
                Phone: phone,
                Email: email,
            };

            const response = await axios.post(`https://dispex.org/api/vtest/HousingStock/client`, clientData);
            console.log('Новый клиент добавлен', clientData);
            if (response.data.result === "ok") {
                await getClients(activeApartmentId);
            }
            return response.data;
        } catch (error) {
            console.error('Ошибка при добавлении клиента', error);
        }
    };

    const deleteClient = async (bindId) => {
        try {
            await axios.delete(`https://dispex.org/api/vtest/HousingStock/bind_client/${bindId}`);
            console.log('Клиент удален', bindId);
            await getClients(activeApartmentId);
        } catch (error) {
            console.error('Ошибка при удалении клиента', error);
        }
    };

    const bindClient = async (clientId, addressId) => {
        console.log("привязка",clientId,addressId )
        try {
            const bindData = {
                ClientId: clientId,
                AddressId: addressId,
            };
            const response = await axios.put(`https://dispex.org/api/vtest/HousingStock/bind_client`, bindData);
            if (response.status === 200) {
                console.log('Клиент привязан', response, bindData);
                await getClients(activeApartmentId);
            }
        } catch (error) {
            console.error('Ошибка при привязке клиента', error);
        }
    };
    const openModal = () => {
        setIsOpen(true);
    };
    const closeModal = () => {
        setIsOpen(false);
    };
    const handleBind = async (clientId) => {
        await bindClient(clientId, activeApartmentId);
        console.log("привязан",clientId, activeApartmentId)
    };
    const handleSave = (client, shouldBind = false) => {
        addClient(client.name, client.phone, client.email)
            .then((res) => {
                if (res.result === 'ok' || shouldBind) {
                    console.log("handleSave", res)
                    handleBind(res.id).then();
                }
                closeModal();
            });
    };

    return (
        <>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={modalStyles}>
                <h2>Добавить жильца</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <label htmlFor="name">Имя:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            placeholder='Ваше имя'
                            style={{width:"200px"}}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <label htmlFor="phone">Телефон:</label>
                        <input
                            type="phone"
                            id="phone"
                            value={phone}
                            style={{width:"200px"}}
                            placeholder='+7 (XXX) XXX-XX-XX'
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            style={{width:"200px"}}
                            placeholder='Ваш электронный адрес'
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <br/>
                    <button type="button" onClick={() => handleSave({ name, phone, email }, true)}>Сохранить и Привязать</button>
                    <button type="button" style={{margin:"0 0 0 45px"}} onClick={closeModal}>Отмена</button>
                </form>
            </Modal>

            <div>
                Улица: {company.nameWithPrefix.split(',')[0]}
                <ul>
                    {flats.map((flat, index) => (
                        <li key={index} style={{ cursor: 'pointer' }} onClick={() => {
                            setActiveFlatId(flat.id === activeFlatId ? null : flat.id);
                            getApartment(flat.id);
                        }}>
                            Дом № {flat.name}
                            {flat.id === activeFlatId && apartment && apartment.map((apartment, subindex) => (
                                <ul key={subindex}>
                                    <li onClick={(event) => {
                                        setActiveApartmentId(apartment.id === activeApartmentId ? null : apartment.id);
                                        event.stopPropagation();
                                        getClients(apartment.id);
                                    }}>
                                        Квартира {apartment.name}
                                        {apartment.id === activeApartmentId && (
                                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px'}}>
                                                {clients.map((client, thirdindex) => (
                                                    <div key={thirdindex} style={{border: '1px solid #ccc', padding: '10px', borderRadius: '5px'}}>
                                                        {client.name} <br/> {client.phone} <br/> {client.email}
                                                        <div>
                                                            <button onClick={(event) => {
                                                                deleteClient(client.bindId);
                                                                event.stopPropagation();
                                                            }}>Удалить</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={(event) => {
                                                    openModal();
                                                    event.stopPropagation();
                                                }}>Добавить</button>
                                            </div>
                                        )}
                                    </li>
                                </ul>
                            ))}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};
export default FlatTree;
