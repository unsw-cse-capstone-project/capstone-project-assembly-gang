import React, { useState, useEffect } from 'react';
import CustomCard from '../components/Card';
import { Input, Button } from 'antd';
import axios from 'axios';

const { Search } = Input;

export default function Books(props) {

    // Normally what'd we do here is call the componentDidMount lifecycle 
    // method which makes an axios GET request and fetches data
    // from the backend and uses it to update the state of the component
    // But for the sake of simplicity, we've hard-coded some book data here.

    // UPDATE: Since we've decided to use hooks, disregard the above.
    // All lifecycle methods have equivalent hooks. I suggest the team 
    // read up the Hooks API doc in the React documentation to fully 
    // understand how hooks replace lifecycle methods.

    // UPDATE (26th June): As can be seen below, I've populated our 
    // backend with some dummy book data. Previously we made an axios
    // request to an external API, however, the code below has been
    // refactored to make a axios request to our API backend using 
    // hooks

    // Upon render, we recieve collection ID from props thanks to <Link>
    // CollectionList.js
    const collectionID = props.location.state.id;

    const [books, updateBooks] = useState(0);
    const [ranSearch, setRanSearch] = useState(false);
    const [collection, setCollection] = useState();

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/collections/${collectionID}`)
            .then(res => {
                setCollection(res.data);
            }
        )
      } , [collection]);  

    const execSearch = (query, flag) => {
        if(flag === true) {
            setRanSearch(true)
            const fetchSearchData = async() => {
                const result = await axios.get('http://127.0.0.1:8000/api/books/');
                updateBooks(result.data);
            }
            fetchSearchData();
        } else {
            setRanSearch(false)
            const fetchData = async() => {
                const result = await axios.get('http://127.0.0.1:8000/api/books/');
                var filtered = result.data.filter(book => {
                    // Explicitly grab only some of books to add to 'Main Collection'
                    if(book.id === 5 || book.id === 2 || book.id === 13) {
                        return book;
                    } else {
                        return null;
                    }
                })
                updateBooks(filtered);
            }
            fetchData();
        }
    }

    return (
        <div>
            <h1 style={{
                position: 'relative',
                right: 600,
                bottom: 25,
            }}>{collection ? collection.collection_name : 'Search Results'}</h1>
            <Search 
                placeholder="Search book by title, author, genre..." 
                onSearch={value => execSearch(value , true)} 
                enterButton 
                style={{ 
                    position: 'relative',
                    width: 535, 
                    right: 75,
                    bottom: 73,
                }}
            />
            <Button style={{
                bottom: 73,
                right: 70,
            }} 
            type={ranSearch ? "danger" : "primary"}
            onClick={value => execSearch(value , false)}
            >Cancel</Button>
            <Button style={{
                bottom: 73,
                right: 65,
            }} 
            type="primary"
            >Back to Collections</Button>
            {
                books === 0 ? 
                    <h4>Your collection is currently empty</h4> 
                : 
                    null
            }
            {/* We pass the 'books' array as a prop to the 'CustomCard' component */}
            {/* <CustomCard booksData={books} ranSearch={ranSearch}/> */}
        </div>
    )

}