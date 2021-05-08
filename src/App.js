import './App.scss'
import { BrowserRouter as Router, Link, Switch, Route } from "react-router-dom"

import React, { Fragment, useEffect, useState } from "react"
import logo from './logo.svg'

// Firebase imports
import firebase from 'firebase/app'
import 'firebase/firestore'
import { collection, query, where, getDocs } from "firebase/firestore";
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { Dropdown } from 'react-dropdown'

// Firebase Init
firebase.initializeApp({
  apiKey: "AIzaSyAEH5xyGwyrr3ztPz2fO8apbBIN-0enJOQ",
  authDomain: "speaksmart-7018b.firebaseapp.com",
  projectId: "speaksmart-7018b",
  storageBucket: "speaksmart-7018b.appspot.com",
  messagingSenderId: "836420254447",
  appId: "1:836420254447:web:f6818e761db4ec2fd7791a"
})

const db = firebase.firestore()



/*---------------------------------------------------------------------APP---------------------------------------------------------*/

function App() {
  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <Link to="/"><img src={logo} /></Link>

        </header>
        <div>
          <Switch>
            <Route exact path="/"><Collection /> </Route>
            <Route path="/book/:id" component={(props) => <Book {...props} />} />
          </Switch>
        </div>
      </Router>
    </div>
  )
}

const InfoBox = ({ title, body, link, searchQuery }) => {
  const [wikiJson, setWikiJson] = useState(null)
    //wikipedia stuff
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`;

  useEffect(async () => {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const json = await response.json();
    setWikiJson(json);
  }, [searchQuery])
  return (
    <Fragment>
    {JSON.stringify(wikiJson)}
    </Fragment>
  );
}

const Book = (props) => {
  const [book, setBook] = useState(null)
  const [currentKeyword, setKeyword] = useState(null)


  useEffect(async () => {
    const bookToSet = await db.collection('books').doc(props.match.params.id).get();
    setBook(bookToSet.data())
  }, [])

  return (
    <>
      <div className="Book">
        {book && (
          <div><h1>{book.name}</h1>
            <img src={book.previewPhoto} alt={book.name} />
            <iframe src={book.pdfLink}></iframe>
            <div>Difficulty Score: {book.difficultyScore}</div>
          </div>
        )}
     </div>
     <div>
       {book && book.keywords.map((keyword) => {return <button onClick={ () => {setKeyword(keyword)} }>{keyword}</button>})}
     </div>
     <div>
      <InfoBox searchQuery={currentKeyword} />
     </div>
    </>
  )
}

const CollectionPreview = ({ previewPhoto, name, to }) => {
  /* */
  return (
    <div className="CollectionPreview">
      <Link to={to}>
        <img src={previewPhoto} />
        {name}
      </Link>
    </div>
  )
}

const Collection = () => {
  let limit = 48
  const [sort, setSort] = useState("one")
  const booksRef = db.collection('books')
  const query = booksRef.orderBy('difficultyScore')

  //console.log(db.getDocs(query))

  //const books = [{name: "harry potter"}, {name: "darth vader"}]
  const [books] = useCollectionData(query, { idField: 'id' });
  console.log(books)

  const options = [
    'one', 'two', 'three'
  ];


  return (
    <div>
      {books && <Fragment>
        {books.map((book) => <CollectionPreview key={book.id} name={book.name} previewPhoto={book.previewPhoto} to={`/book/${book.id}`} />)}
      </Fragment>}
    </div>
  )
}

export default App
