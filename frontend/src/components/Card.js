import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Button, Popover, Select, message } from 'antd';
import BookCover from '../images/book_cover.jpg';
import { useForm, Controller } from 'react-hook-form';
import { connect } from 'react-redux';
import axios from 'axios';

const { Option } = Select;
const key = 'updatable';

function CustomCard(props) {

    const [collections, setCollections] = useState([]);

    const { handleSubmit, control } = useForm({});

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/collections/')
            .then(res => {
                var filtered = res.data.filter(collection => {
                    if(parseInt(props.user_id) === collection.owner) {
                        return collection;
                    } else {
                        return null;
                    }
                })
                setCollections(filtered);
            })
    } , [])

    const addBookSuccess = () => {
        message.loading({ content: 'Processing...', key });
            setTimeout(() => {
                // Trigger Books Component to re-render by running useEffect() after a 2 second timeout
                // which renders an alert message to the browser...
                message.success({ content: 'Book added to collection(s)!', key, duration: 2 });
            }, 1000);
    };

    // Add book to collection(s) and increment 'Count' for collection
    const onSubmit = (data) => {
        data.selectedCollections.map(collection => {
            var split = collection.split(',');
            axios.post('http://127.0.0.1:8000/api/contains/' , {
                collection: parseInt(split[0]),
                book: parseInt(split[1]),
            })
            .then(res => {
                collections.map(collection => {
                    if(collection.id === parseInt(split[0])) {
                        axios.patch(`http://127.0.0.1:8000/api/collections/${split[0]}/` , {
                            count: collection.count + 1,
                        })
                        .then(res => {
                            console.log(res);
                        }).catch(err => {
                            console.log(err);
                        })
                    }
                })
            }).catch(err => {
                console.log(err);
            })
        })
    }

    const removeBookSuccess = () => {
        message.loading({ content: 'Processing...', key });
            setTimeout(() => {
                // Trigger Books Component to re-render by running useEffect() after a 2 second timeout
                // which renders an alert message to the browser...
                message.warning({ content: 'Book removed from collection successfully!', key, duration: 2 });
                props.setBooks([]);
                props.setBookDelete(props.bookDelete + 1);
            }, 1000);
    };

    const markBookAsReadSuccess = () => {
        message.loading({ content: 'Processing...', key });
            setTimeout(() => {
                // Trigger Books Component to re-render by running useEffect() after a 2 second timeout
                // which renders an alert message to the browser...
                message.warning(
                    { 
                        content: 'Congrats on finishing this book! We\'ve conveniently added the book to your \'Finished\' collection list. Happy Reading!', 
                        key, 
                        duration: 5 
                    }
                );
                props.setBooks([]);
                props.setBookDelete(props.bookDelete + 1);
            }, 1000);
    };

    const handleDelete = (bookID , collectionID, MarkAsRead) => {
        axios.get('http://127.0.0.1:8000/api/contains/')
            .then(res => {
                    var objToDelete = res.data.filter(contain => {
                       if(contain.collection === collectionID && contain.book === bookID) {
                           return contain;
                       } else {
                           return null;
                       }
                    });
                    const triggerDelete = async() => {
                        axios.delete(`http://127.0.0.1:8000/api/contains/${objToDelete[0].id}`)
                            .then(res => {
                                if(MarkAsRead) {
                                    markBookAsReadSuccess();
                                    handleMarkAsRead(bookID, collectionID);
                                } else {
                                    removeBookSuccess();
                                }
                            }).catch(err => {
                                console.log(err);
                            })
                        }
                    const updateCollectionCount = async() => {
                        axios.get(`http://127.0.0.1:8000/api/collections/${collectionID}`)
                            .then(res => {
                                axios.patch(`http://127.0.0.1:8000/api/collections/${collectionID}/` , {
                                    count: res.data.count - 1,
                                })
                                .catch(err => {
                                    console.log(err);
                                })
                            })
                            .catch(err => {
                                console.log(err);
                            })
                    }
                    triggerDelete();
                    updateCollectionCount();
            })
    }

    const handleMarkAsRead = (bookID, collectionID) => {
        collections.filter(collection => {
            if(collection.collection_type === "Finished") {
                axios.post('http://127.0.0.1:8000/api/contains/' , {
                    collection: collection.id,
                    book: bookID,
                }
            )
            axios.patch(`http://127.0.0.1:8000/api/collections/${collection.id}/` , {
                count: collection.count + 1,
            })
            } else {
                return null;
            }
        })
    }

    return (
        <div className="site-card-wrapper" style={{ position: 'relative' , bottom: 50, left: -20}}>
            <Row gutter={16}>
            {
                props.booksData.map((book, index) => {
                    return (
                        <Col key={index}>
                            <Card 
                                title={book.book_title} 
                                bordered={true}
                                cover={<img alt="example" src={BookCover} />}
                                style={{ width: 300, height: 600, background: '#cfcdc6'}}
                                hoverable
                                extra={
                                    props.partOf ? 
                                        (<Popover
                                            placement="topLeft"
                                            content={
                                                collections ?
                                                <div>
                                                    <p>Are you sure you want to remove this book from this collection ?</p>
                                                    <Button onClick={() => handleDelete(book.id , props.collectionID, false)} type="danger">Confirm</Button>
                                                </div>
                                                : null}
                                            title="Remove From Collection ?"
                                            trigger="click"
                                            arrowPointAtCenter={true}
                                        >
                                            {props.partOf ? <Button type="danger">Remove</Button> : <Button type="primary">+ Add</Button>}
                                        </Popover>) : 
                                        (<Popover
                                            placement="topLeft"
                                            content={
                                                collections ?
                                                    <form
                                                        onSubmit={handleSubmit(onSubmit)}
                                                    >
                                                    <Controller
                                                        name="selectedCollections"
                                                        control={control}
                                                        as={
                                                            <Select placeholder="Choose collection(s)" style={{ width: 250,paddingRight: 10 }} mode="multiple" allowClear={true}>
                                                                {collections.map(collection => {
                                                                    return (
                                                                        collection.collection_type !== "Finished" ? <Option value={`${collection.id},${book.id}`}>{collection.collection_name}</Option> : null
                                                                    )
                                                                })}
                                                            </Select>
                                                        }
                                                    />
                                                        <Button onClick={addBookSuccess} type="primary" htmlType="submit">Submit</Button>
                                                    </form> 
                                            : null}
                                            title="Add To Collection ?"
                                            trigger="click"
                                            arrowPointAtCenter={true}
                                        >
                                            {props.partOf ? <Button type="danger">Remove</Button> : <Button type="primary">+ Add</Button>}
                                        </Popover>)
                                }
                            >
                                {book.book_synopsis}                       
                            </Card>
                            <Button style={{ position : 'relative', bottom: 50 }} type="primary" shape="round">View Details</Button>
                            {props.partOf ? 
                                <Button 
                                    style={{ 
                                        position : 'relative', 
                                        bottom: 50, left: 5 
                                    }} 
                                    type="primary" 
                                    shape="round"
                                    onClick={() => handleDelete(book.id, props.collectionID, true)}
                                >
                                        Mark as Read
                                </Button> 
                                    : 
                                null
                            }
                        </Col>
                    )
                })
            }
            </Row>
        </div>
    )
}

const mapStateToProps = state => {
    return {
        user_id: state.user_id,
    }
}

export default connect(mapStateToProps)(CustomCard);