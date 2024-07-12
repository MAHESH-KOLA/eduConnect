import React from 'react'
import Featurebox from './Featurebox'
import first from '../images/first.jpg'
import second from '../images/second.jpg'
import third from '../images/third.jpg'
import fourth from '../images/fourth.jpg'
function Features() {
  return (
    <div id='features'>
        <h1>Features</h1>
        <div className='a-container'>
            <Featurebox  title = "Upload Project" image = {first} content = "Provided functionality to upload your projects"/>
            <Featurebox  title = "Search Projects"  image = {second} content = "Can search Projects based on its domain"/>
            <Featurebox  title = "Authorized Login" image = {third} content = "Only Authorized people can log in"/>
            <Featurebox  title = "Edit your Project" image = {fourth} content = "Provided functionality to edit your projects"/>
        </div>
     </div>
  )
}

export default Features