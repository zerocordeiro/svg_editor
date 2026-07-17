import { useState, useRef, useCallback } from 'react'
import './App.css'
import traverseElements from './assets/js/traverseElements.js';



function App() {
  // we need an object in which to store the SVG file
  // const [svgFile, setSvgFile] = useState(null);
  // we also need an object that will store the svg structure, as in an object that will represent the svg structure, so we can manipulate it later on.
  const [svgDoc, setSvgDoc] = useState(null);
  
  const [svgControllers, setSvgControllers] = useState({});
  const [selectedEl, setSelectedEl] = useState(null);
  
  const [svgTree, setSvgTree] = useState([]);


  const selectedElRef = useRef(null);
  const svgControllersRef = useRef({});

  const registerSvgController = useCallback((id, controller) => {
    svgControllersRef.current[id] = controller; // sync immediately
  }, []);

  const [ruleState, setRuleState] = useState({
  'stroke-width': { enabled: true, value: '' },
  'stroke': { enabled: true, value: '#000000' }
});

function updateRule(ruleName, patch) {
  setRuleState(prev => ({
    ...prev,
    [ruleName]: { ...prev[ruleName], ...patch }
  }));
}
  
  const [svgStyles, setSvgStyles] = useState([]);
  function toggleCollapsedUl(event){
    if (event.target !== event.currentTarget) return;
    console.log('toggled collapse in: ', event.currentTarget);

    event.currentTarget.classList.toggle('collapsed');
  }
  function TreeNode({ node, level = 0 }) {
    return (
      <li>
        <button
          data-elid={node.id}
          className={selectedEl === node.id ? 'selectedButton' : ''}
          onClick={() => selectElement(node.id)}
          style={{ marginLeft: `${level * 12}px`}}
        >
          {node.tag}: {node.id}
        </button>
  
        {node.children?.length > 0 && (
          <ul className="collapsableList" >
            {node.children.map(child => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }
  // this will set a "global" variable that will "point" to the element that is being edited currently. It will be used by another function that will call the respective controller for the element.
  function selectElement(elId) {
    selectedElRef.current = elId; // sync immediately

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

  async function changeRules() {
    // console.log('svgControllers: ', svgControllers);

    const currentElId = selectedElRef.current;
    const controller = currentElId ? svgControllersRef.current[currentElId] : null;

    console.log('currentElId: ', currentElId);
    console.log('controller: ', controller);

    if (!currentElId || !controller) {
      alert('No element selected or controller not ready.');
      return;
    }


    const rulesToApply = {};
    
    rulesArray.forEach((rule) => {
      const input = document.getElementById(rule.inputId);
      if (!input) return;

      const value = input.value;
      if (value !== '') rulesToApply[rule.rule] = value;
    });

    if (Object.keys(rulesToApply).length === 0) {
      alert('No rules to apply. Please set at least one rule value.');
      return;
    }
    
    controller.changeCssRules(rulesArray, rulesToApply);

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

    // reset controllers  before rebuilding controllers
    svgControllersRef.current = {};
    setSvgControllers({});

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

      const svgStyle = svgParsed.querySelector('style');
      console.log('SVG style: ', svgStyle);

      // We'll make a function that will be used recursively to check the elements inside other elements in the SVG. For example, it will be used to check insige a group and if this group has anopther group as a child it will execute the same function to see inside this child group. The data will be organized as an object with the parameters: tag, id, classList, contents (Array of objects with the same structure).
      


      let svgStructureArray = [];

      Array.from(svgParsed.querySelectorAll('svg > *')).forEach(element => {
        svgStructureArray.push(traverseElements(element, registerSvgController));

        // These IFs are just to get the groups and elements arrays, which may be used for the groups and elements
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
      });

      setSvgTree(svgStructureArray);
      // Traverse through all SVG elements

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
              <ul>
                {svgTree.map(node => (
                  <TreeNode key={node.id} node={node} />
                ))}
              </ul>
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
