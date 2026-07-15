import { useState } from 'react'
import './App.css'

class svgElementController {
  // class that will be used to make an individual controller for each element and group of the SVG. This class will carry methods that will be used to edit properties of the elements and groups, as well as methods to add and remove elements and groups. It will also have a method to get the properties of the element or group.
  constructor(element, elId) {

    this.element = element;
    //this.button = document.createElement('button');
    this.element.id = elId;
    this.element.dataAnimId = elId;
    this.element.classList = this.element.classList ? this.element.classList : [];
    //this.button.innerHTML = `${this.element.tagName} - ID: ${elId ? elId : 'noId'}`;
    //this.button.addEventListener('click', () => {
    //  this.changeStroke();
    //});
  }
  init() {
    // Initialization code here
    //document.querySelector('#svgContents').appendChild(this.button);
    // this.changeStroke();
  }
  changeStroke() {
    console.log('changing stroke of element: ', this.element);
    this.element = document.getElementById(`${this.element.id}`);
    !this.element.querySelector('style') && this.element.appendChild(document.createElement('style'));
    const elStyle = this.element.querySelector('style');
    // get the classlist array for this element and make a string with all the classes separated by a dot, so we can use it as a selector in the css. If the element has no classes, we will use just the id as a selector.
    const elClasses = this.element.classList.length > 0 ? '.' + Array.from(this.element.classList).join('.') : '';

    const elCss = `#${this.element.id}${elClasses} { 
      stroke: red; 
      stroke-width: 2px; 
      animation-name: ${this.element.id}_anim;
      transform-origin: center;
      animation-duration: 10s;
      animation-iteration-count: infinite;
      animation-play-state: paused;
    }
    @keyframes ${this.element.id}_anim {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }`;
    elStyle.type = 'text/css';
    elStyle.innerHTML = elCss;

    if (elStyle.styleSheet) {
      elStyle.styleSheet.cssText = elCss;
    } else {
      elStyle.appendChild(document.createTextNode(elCss));
    }

    //this.element.setAttribute('stroke', 'red');
    //this.element.setAttribute('stroke-width', '2px');
  }
}

function App() {
  // we need an object in which to store the SVG file
  // const [svgFile, setSvgFile] = useState(null);
  // we also need an object that will store the svg structure, as in an object that will represent the svg structure, so we can manipulate it later on.
  const [svgStructure, setSvgStructure] = useState([]);
  const [svgDoc, setSvgDoc] = useState(null);
  const [selectedEl, setSelectedEl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [svgElements, setSvgElements] = useState({}); // Store controllers for each element by their ID
    const [svgStyles, setSvgStyles] = useState([]);

  // this will set a "global" variable that will "point" to the element that is being edited currently. It will be used by another function that will call the respective controller for the element.
  function selectElement(elId) {
    setSelectedEl(elId);
  }

  function changeStroke(){
    if (selectedEl && svgElements[selectedEl]) {
      const myElementController = svgElements[selectedEl].controller;
    }else{
      alert('No element selected or element controller not found.');
    }
  }
  function handlePlay() {
    const nextState = isPlaying ? 'paused' : 'running';
    document.querySelectorAll('#svgView *').forEach(el => {
      const styleEl = el.querySelector(':scope > style');
      if (styleEl) {
        styleEl.innerHTML = styleEl.innerHTML.replace(
          /animation-play-state:\s*(paused|running)/g,
          `animation-play-state: ${nextState}`
        );
      }
    });
    setIsPlaying(!isPlaying);
  }

    function toggleStyle(id) {
    const updated = svgStyles.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    setSvgStyles(updated);
  
    // Group rules back by sheet and rewrite each style element
    const styleEls = document.querySelectorAll('#svgView style');
    styleEls.forEach((styleEl, sheetIdx) => {
      const sheetRules = updated.filter(r => r.sheetIdx === sheetIdx);
      styleEl.innerHTML = sheetRules
        .filter(r => r.enabled)
        .map(r => r.cssText)
        .join('\n');
    });
  }

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
    reader.onload = async function (e) {
      await readSVG(e);
    };
    async function readSVG(e) {
      const svgElementsArray = [{}]; // Initialize an array to hold the SVG elements
      const svgString = e.target.result;
      const parser = new DOMParser();
      const svgParsed = parser.parseFromString(svgString, 'image/svg+xml');

      console.log('svg parsed: ', svgParsed);

      let groups = [];
      let elements = [];

      document.querySelector('#svgContents').innerHTML = ''; // Clear the contents before adding new elements

      const svgStyle = svgParsed.querySelector('style');
      console.log('SVG style: ', svgStyle);

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
        const myController = new svgElementController(element, elementData.id);
        myController.init();
        
        svgElementsArray[elementData.id] = myController;

        const elBtn = document.createElement('button');
        elBtn.setAttribute('da-elId', elementData.id);

        elBtn.innerHTML = `${elementData.id}`;

        document.querySelector('#elementList').appendChild(elBtn);

        elBtn.addEventListener('click', ()=>{
selectElement(elementData.id);
        })
        
        return elementData;
      }

      setSvgElements(svgElementsArray);
      console.log('🕵️ svgElementsArray: ', svgElementsArray);

      let svgStructureArray = [];

      // Traverse through all SVG elements
      Array.from(svgParsed.querySelectorAll('svg > *')).forEach(element => {
        if (element.tagName === 'g') { // Groups are <g> tags
          console.log('group found: ', element);
          groups.push({
            id: element.id,
            attributes: Object.keys(element.attributes)
          });
        } else {
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
      console.log('groups: ', groups);
      console.log('elements: ', elements);

      console.log('svg structure: ', svgStructureArray); // This will now show the correct structure
      setSvgStructure(svgStructureArray); // Set it once with the complete array

      setSvgDoc(svgParsed);
      console.log('svg contents:', svgParsed);
      svgView.innerHTML = svgParsed.documentElement.outerHTML;
    
      // Read rules AFTER injection so .sheet is available
      const rules = [];
      svgView.querySelectorAll('style').forEach((styleEl, sheetIdx) => {
        const sheet = styleEl.sheet;
        if (!sheet) return;
        Array.from(sheet.cssRules).forEach((rule, ruleIdx) => {
          rules.push({
            id: `${sheetIdx}-${ruleIdx}`,
            label: rule.selectorText || '@rule',
            cssText: rule.cssText,
            enabled: true,
            sheetIdx,
            ruleIdx
          });
        });
      });
      setSvgStyles(rules);

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
            <button id="playBtn" onClick={handlePlay}>{isPlaying ? 'Pause' : 'Play'}</button>
            <button id="changeStrokeBtn" onClick={changeStroke}>Change Stroke</button>
            <ul>
    {svgStyles.map(rule => (
      <li key={rule.id}>
        <label>
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={() => toggleStyle(rule.id)}
          />
          {rule.label}
        </label>
      </li>
    ))}
  </ul>
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
