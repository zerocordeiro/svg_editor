import { useState } from 'react'
import './App.css'
import traverseElements from './assets/js/traverseElements.js';



function App() {
  // we need an object in which to store the SVG file
  // const [svgFile, setSvgFile] = useState(null);
  // we also need an object that will store the svg structure, as in an object that will represent the svg structure, so we can manipulate it later on.
  const [svgDoc, setSvgDoc] = useState(null);
  const [svgControllers, setSvgControllers] = useState({});
  const [selectedEl, setSelectedEl] = useState(null);
  
  const [svgStyles, setSvgStyles] = useState([]);

  // this will set a "global" variable that will "point" to the element that is being edited currently. It will be used by another function that will call the respective controller for the element.
  function selectElement(elId) {
    setSelectedEl(elId);
    console.log('selected element: ', elId);
    const svgView = document.getElementById('svgView');
    svgView.querySelectorAll('.selectedSvgElement').forEach(el => el.classList.remove('selectedSvgElement'));
    const selectedElement = svgView.querySelector(`#${elId}`);
    selectedElement && selectedElement.classList.add('selectedSvgElement');

  }

  const rulesArray = [
        {
          inputId: "ruleInputStrokeWidth",
          inputType: "checkbox",
          inputLabel: "Stroke Width",
          valueType: "number",
          rule: "stroke-width",
          inputToggle: "ruleToggleStrokeWidth"
        },
        {
          inputId: "ruleInputStrokeColor",
          inputType: "checkbox",
          inputLabel: "Stroke Color",
          valueType: "color",
          rule: "stroke",
          inputToggle: "ruleToggleStrokeColor"
        }
      ];
            function RuleInputs({ rule }) {
              return (
                <span className="ruleSetter">
              <input type={rule.inputType} className="ruleToggle" defaultChecked/> <label htmlFor={rule.inputId}>{rule.inputLabel}:</label> <input type={rule.valueType} id={rule.inputId} className="ruleInput"/>
            </span>
              )
            }

  function changeRules() {
    console.log('svgControllers: ', svgControllers);
    ruleInputStrokeWidth = document.getElementById('ruleInputStrokeWidth').value;
    ruleInputStrokeColor = document.getElementById('ruleInputStrokeColor').value;
    console.log('ruleInputStrokeWidth: ', ruleInputStrokeWidth);
    console.log('ruleInputStrokeColor: ', ruleInputStrokeColor);

    if (selectedEl && svgControllers[selectedEl]) {
      const myElementController = svgControllers[selectedEl];
      myElementController.changeCssRules();

    } else {
      alert('No element selected or element controller not found.');
    }
  }
    function handlePlay() {
    document.querySelectorAll('#svgView *').forEach(el => {
      const styleEl = el.querySelector(':scope > style');
      if (styleEl && styleEl.innerHTML.includes('animation-name')) {
        // 1. Override the stylesheet animation with "none" via inline style
        el.style.animation = 'none';
        // 2. Force a reflow — this makes the browser "forget" the animation state
        void el.offsetWidth;
        // 3. Clear the inline override so the stylesheet takes back control
        el.style.animation = '';
        // 4. Ensure play state is running in the style tag
        styleEl.innerHTML = styleEl.innerHTML.replace(
          /animation-play-state:\s*(paused|running)/g,
          'animation-play-state: running'
        );
      }
    });
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
      


      let svgStructureArray = [];

      // Traverse through all SVG elements
      Array.from(svgParsed.querySelectorAll('svg > *')).forEach(element => {
        if (element.tagName === 'g') { // Groups are <g> tags
          // console.log('group found: ', element);
          groups.push({
            id: element.id,
            attributes: Object.keys(element.attributes)
          });
        } else {
          // console.log('element found: ', element);
          elements.push({
            tag: element.tagName,
            id: element.id,
            attributes: Object.keys(element.attributes)
          });
        }
            document.querySelector('#svgContents').innerHTML = '';

        svgStructureArray.push(traverseElements(element,setSvgControllers,selectElement));

      });

      // You can now work with the groups and elements arrays
      console.log('groups: ', groups);
      console.log('elements: ', elements);

      console.log('svg structure: ', svgStructureArray); // This will now show the correct structure

      setSvgDoc(svgParsed);
      console.log('svg contents:', svgDoc);
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
            <button id="playBtn" onClick={handlePlay}>Play</button>
            
            {rulesArray.map(rule => (
              <RuleInputs rule={rule} />
            ))}

            <button id="changeCssBtn" onClick={changeRules}>Change Rules</button>
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
