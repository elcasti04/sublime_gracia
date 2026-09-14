import './App.css'
import { useNavigate } from 'react-router-dom'
import Historia from './page/historia'
import Anuncios from './page/anuncio'

function App() {

  const navigate = useNavigate()

  return (
    <>
    <div className="app">
      <h1 className='titulo'>
        El arte
        <br />  
        <span>del Perfume</span>
      </h1>
      <br />
      <br />
      <p>
        Fragancias de alta costura elaboradas con ingredientes raros de los cuatro rincones del mundo. <br />
        Cada perfume, una historia escrita en el aire.
      </p>
      <br />
      <div className='botones'>
        <p className='iz' onClick={() => navigate('/catalogo')}>Explorar Colección ➺</p>
        <p className='de'
            onClick={() => {
            document.getElementById("historia")?.scrollIntoView({
            behavior: "smooth"
            });
          }}
        >Ver Historia ➺</p>
      </div>
    </div>
    <Anuncios></Anuncios>
    <div id='historia'>
      <Historia></Historia>
    </div>
    </>
  )
}

export default App
