import { useState } from 'react'
import './App.css'

class svgController {
  // class that will be used to make an individual controller for each element and group of the SVG. This class will carry methods that will be used to edit properties of the elements and groups, as well as methods to add and remove elements and groups. It will also have a method to get the properties of the element or group.
  constructor(element, elId) {

    this.element = element;
    this.button = document.createElement('button');
    this.element.id = elId;
    this.button.innerHTML = `${this.element.tagName} - ID: ${elId ? elId : 'noId'}`;
    this.button.addEventListener('click', () => {
      this.changeStroke();
    });
    this.init();
  }
  init() {
    // Initialization code here
    document.querySelector('#svgContents').appendChild(this.button);
    // this.changeStroke();
  }
  changeStroke(){
    console.log('changing stroke of element: ', this.element);
    this.element = document.getElementById(`${this.element.id}`);
    this.element.setAttribute('stroke', 'red');
    this.element.setAttribute('stroke-width', '2px');
  }
}

function App() {
  // we need an object in which to store the SVG file
  const [svgFile, setSvgFile] = useState(null);
  // we also need an object that will store the svg structure, as in an object that will represent the svg structure, so we can manipulate it later on.
  const [svgStructure, setSvgStructure] = useState([]);
  const [svgDoc, setSvgDoc] = useState(null);
  
  async function handleFileChange(event) {
    const svgView = document.getElementById('svgView');
    // this will check the uploaded file and first see if it is a SVG. If it isn't, it will alert the user that the file is not a SVG and end the execution. If it is a SVG, it will alert the user that the file has been changed.
    const file = event.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      // alert('File changed');
    } else {
      alert('The selected file is not a SVG.');
      return;
    }
    console.log(file);
    // after checking that the file is a svg, it will read the file and parse it as an object. It will then log the object to the console.
    const reader = new FileReader();
    reader.onload = async function(e) {
      await readSVG(e);
    };
    async function readSVG(e) {
      const svgString = e.target.result;
      const parser = new DOMParser();
      const svgParsed = parser.parseFromString(svgString, 'image/svg+xml');

      console.log('svg parsed: ', svgParsed);

      let groups = [];
      let elements = [];

      const svgStyle = svgParsed.querySelector('style');
      console.log('svg style: ', svgStyle);

      // We'll make a function that will be used recursively to check the elements inside other elements in the SVG. For example, it will be used to check insige a group and if this group has anopther group as a child it will execute the same function to see inside this child group. The data will be organized as an object with the parameters: tag, id, classList, contents (Array of objects with the same structure).
      async function traverseElements(element) {
        const elementData = {};
        const currentDate = await new Date().getTime();
        
        elementData.tag = element.tagName;
        elementData.id = element.id ? element.id : currentDate;
        elementData.classList = Array.from(element.classList);
        elementData.children = [];
        Array.from(element.children).forEach(child => {
          if (child.tagName === 'g') {
            console.log('group found: ', child);
            elementData.children.push(traverseElements(child)); // Recursively traverse child elements
            
          } else {
            console.log('element found: ', child);
            elementData.children.push({
              tag: child.tagName,
              id: child.id ? child.id : currentDate,
              classList: Array.from(child.classList),
              children: []
            });
            // document.querySelector('#svgContentsList').innerHTML += `<li>Element: ${child.tagName}, ID: ${child.id ? child.id : 'noId'}, Classes: ${Array.from(child.classList).join(', ')}</li>`;
          }
        });
        const myController = new svgController(element,elementData.id);
        return elementData;
      }

      let svgStructureArray = [];

      // Traverse through all SVG elements
        Array.from(svgParsed.querySelectorAll('svg > *')).forEach(element => {
            if (element.tagName === 'g') { // Groups are <g> tags
              console.log('group found: ', element);
                groups.push({
                    id: element.id,
                    attributes: Object.keys(element.attributes)
                });
            } else{
              console.log('element found: ', element);
              elements.push({
                  tag: element.tagName,
                  id: element.id,
                  attributes: Object.keys(element.attributes)
              });
            }
          svgStructureArray.push(traverseElements(element));

        });

        // You can now work with the groups and elements arrays
        console.log('groups: ',groups);
        console.log('elements: ',elements);
        
        console.log('svg structure: ', svgStructureArray); // This will now show the correct structure
        setSvgStructure(svgStructureArray); // Set it once with the complete array

      setSvgDoc(svgParsed);
      console.log('svg contents:', svgParsed);
      svgView.innerHTML = svgParsed.documentElement.outerHTML;
      
      return false;
    }
    reader.readAsText(file);
  }

  

  return (
    <>
      <section id="appContainer">
        <div className="flexrow fullwidth flex1">
          <div id="elementList">
            Element List
            <span id="svgContents">

            </span>
          </div>
          <div id="SVGDisplay">
            Display
            {/* I will insert an input which will be expecting a svg. It will get this SVG, then read it and parse it as an object */}
            <input id="svgInput" type="file" accept=".svg" onChange={handleFileChange} />
            <span id="svgView"></span>
          </div>
          <div id="propertiesList">
            Properties List
          </div>
        </div>
        {/* <div id="timelineContainer">
          Timeline Container
        </div> */}
      </section>
    </>
  )
}

export default App
