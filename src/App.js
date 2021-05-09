import './App.scss'
import { BrowserRouter as Router, Link, Switch, Route } from "react-router-dom"

import React, { Fragment, useEffect, useState } from "react"
import logo from './logo.svg'

// Firebase imports
import firebase from 'firebase/app'
import 'firebase/firestore'
import { collection, query, where, getDocs } from "firebase/firestore"
import { useCollectionData } from 'react-firebase-hooks/firestore'
import { Dropdown } from 'react-dropdown'
import Scroll from "react-scroll"

const scroll = Scroll.animateScroll

// Firebase Init
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyAEH5xyGwyrr3ztPz2fO8apbBIN-0enJOQ",
    authDomain: "speaksmart-7018b.firebaseapp.com",
    projectId: "speaksmart-7018b",
    storageBucket: "speaksmart-7018b.appspot.com",
    messagingSenderId: "836420254447",
    appId: "1:836420254447:web:f6818e761db4ec2fd7791a"
  })
} else {
  firebase.app() // if already initialized, use that one
}


const db = firebase.firestore()



/*---------------------------------------------------------------------APP---------------------------------------------------------*/

function App() {
  return (
    <div className="App">
      <Router>
        <header className="App-header">
          <Link to="/"><img src={logo} /></Link>

        </header>
        <div className="rest">
          <Switch>
            <Route exact path="/"><Collection /> </Route>
            <Route path="/book/:id" component={(props) => <Book {...props} />} />
          </Switch>
        </div>
      </Router>
    </div>
  )
}

const InfoSnippet = ({ title, body, link }) => {
  return (
    <div className="InfoSnippet">
      <h3>
      <a href={link} target="_blank">{title}</a>
      </h3>
      <div dangerouslySetInnerHTML={{ __html: body + "..." }} />
    </div>
  )
}

const InfoBox = ({ searchQuery, lang }) => {
  const [wikiJson, setWikiJson] = useState(searchQuery)
  //wikipedia stuff
  const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchQuery}`

  useEffect(async () => {
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw Error(response.statusText)
    }
    const json = await response.json()
    setWikiJson(json)
  }, [searchQuery])

  return (
    <div className="InfoBox">
      {wikiJson && searchQuery &&
        <Fragment>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <InfoSnippet title={wikiJson.query.search[i].title} link={`https://${lang}.wikipedia.org/?curid=${wikiJson.query.search[i].pageid}`} body={wikiJson.query.search[i].snippet} />))
          }
        </Fragment>
      }
    </div>
  )
}

const Book = (props) => {
  const [book, setBook] = useState(null)
  const [currentKeyword, setKeyword] = useState(null)


  useEffect(async () => {
    const bookToSet = await db.collection('books').doc(props.match.params.id).get()
    setBook(bookToSet.data())
  }, [])

  return (
    <div className="Book">
      {book && (
        <div className="book-info">
          <div className="top">
            <div className="left">
              <h1>{book.name}</h1>
              <div>Difficulty Score: {book.difficultyScore}</div>
              <ul><strong>Keywords:</strong> {book && book.keywords.map(keyword => <li> {keyword} </li>)} </ul>
              <img src={book.previewPhoto} alt={book.name} />
            </div>
            <iframe frameBorder={false}  src={book.pdfLink}></iframe>
          </div>
        </div>
)}
      <div className="bottom">
      <div className="keywords">
        Keywords: {book && book.keywords.map((keyword) => <button className={currentKeyword === keyword ? "current" : ""} onClick={() => {
           setKeyword(keyword) 
           scroll.scrollToBottom({
            //  duration: 3000,
              //  smooth: 'easeOutCubic',
           })

          }}>{keyword}</button> )}
</div>
        {book &&  <Fragment>
          <InfoBox searchQuery={currentKeyword} lang={book.lang} /></Fragment>}
      </div>
    </div>
  )
}

const CollectionPreview = ({ previewPhoto, name, to, score }) => {
  /* */
  return (
    <div className="CollectionPreview">
      <Link to={to}>
        <img src={previewPhoto} />
        {name} -
      difficulty score: {score}
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
  const [books] = useCollectionData(query, { idField: 'id' })
  console.log(books)

  const options = [
    'one', 'two', 'three'
  ]


  return (
    <div>
      {books && <Fragment>
        {books.map((book) => <CollectionPreview key={book.id} score={book.difficultyScore} name={book.name} previewPhoto={book.previewPhoto} to={`/book/${book.id}`} />)}
      </Fragment>}
    </div>
  )
}

export default App
