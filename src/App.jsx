import { useState, useRef, useCallback, useEffect } from 'react'
import './App.css'
import traverseElements from './assets/js/traverseElements.js';


const RULES_CONFIG = [
  {
    inputId: "ruleInputStrokeWidth",
    inputLabel: "Stroke Width",
    valueType: "number",
    rule: "stroke-width",
    inputToggle: "ruleToggleStrokeWidth"
  },
  {
    inputId: "ruleInputStrokeColor",
    inputLabel: "Stroke Color",
    valueType: "color",
    rule: "stroke",
    inputToggle: "ruleToggleStrokeColor"
  },
  {
    inputId: "ruleInputOpacity",
    inputLabel: "Opacity",
    valueType: "number",
    otherProps: { min: 0, max: 1, step: 0.05 },
    rule: "opacity",
    inputToggle: "ruleToggleOpacity"
  },
  {
    rule: "transform",
    label: "Transform",
    inputs: [
      {
        inputId: "ruleInputTranslateX",
        inputLabel: "Translate X (px)",
        valueType: "number",
        rule: "translateX",
        inputToggle: "ruleToggleTranslateX"
      },
      {
        inputId: "ruleInputTranslateY",
        inputLabel: "Translate Y (px)",
        valueType: "number",
        rule: "translateY",
        inputToggle: "ruleToggleTranslateY"
      },
      {
        inputId: "ruleInputRotate",
        inputLabel: "Rotate (deg)",
        valueType: "number",
        rule: "rotate",
        inputToggle: "ruleToggleRotate"
      }
    ]
  }
];

function TreeNode({ node, level = 0 ,selectedEl, onSelect}) {
    return (
      <li>
        <button
          data-elid={node.id}
          className={selectedEl === node.id ? 'selectedButton' : ''}
          onClick={() => onSelect(node.id)}
          style={{ marginLeft: `${level * 12}px` }}
        >
          {node.tag}: {node.id}
        </button>

        {node.children?.length > 0 && (
          <ul className="collapsableList" >
            {node.children.map(child => (
              <TreeNode 
              key={child.id} 
              node={child} 
              level={level + 1}
              selectedEl={selectedEl}
              onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  function RuleInputs({ rule, state, onUpdate }) {
    return (
      <span className="ruleSetter">
        <input
          id={rule.inputToggle}
          type="checkbox"
          className="ruleToggle"
          checked={state.enabled}
          onChange={(e) => onUpdate(rule.rule, { enabled: e.target.checked })}
        />
        <label htmlFor={rule.inputId}>{rule.inputLabel}:</label>
        <input
          id={rule.inputId}
          type={rule.valueType}
          className="ruleInput"
          value={state.value}
          disabled={!state.enabled}
          {...rule.otherProps}
          onChange={(e) => onUpdate(rule.rule, { value: e.target.value })}
        />
      </span>
    )
  }

    // ...existing code...
  function applyStylesToDom(stylesMap) {
    const svgView = document.getElementById('svgView');
    if (!svgView) return;
  
    // We use Object.entries next, which will return an array of [key, value] pairs from the stylesMap object. We then iterate over this array using forEach.
    // For each pair, we destructure it into elId (the key) and rules (the value). We then use querySelector to find the target element in the DOM by its ID. If the element is found, we iterate over the rules object and apply each CSS rule to the target element using setProperty.
    Object.entries(stylesMap).forEach(([elId, rules]) => {
      const targetEl = svgView.querySelector(`#${CSS.escape(elId)}`); //CSS.escape() makes the string safe to use with the selector
      if (!targetEl) return;
  
      Object.entries(rules).forEach(([rule, value]) => {
        if (value !== '') {
          targetEl.style.setProperty(rule, value);
        }
      });
    });
  }
  // ...existing code...

function App() {
  // we need an object in which to store the SVG file
  // const [svgFile, setSvgFile] = useState(null);
  // we also need an object that will store the svg structure, as in an object that will represent the svg structure, so we can manipulate it later on.
  const [svgDoc, setSvgDoc] = useState(null);

  const [selectedEl, setSelectedEl] = useState(null);

  const [svgTree, setSvgTree] = useState([]);

  const [stylesByElementId, setStylesByElementId] = useState({});

  const [keyframes, setKeyframes] = useState({
    // { [elementId]: [{ frame: 0, styles: {...} }, { frame: 30, styles: {...} }] }
  });
  const [currentFrame, setCurrentFrame] = useState(0);


  const selectedElRef = useRef(null);

  const [ruleState, setRuleState] = useState({
    'stroke-width': { enabled: true, value: '' },
    'stroke': { enabled: true, value: '#000000' },
    'opacity': { enabled: true, value: '1' },
    'transform': { enabled: true, value: '' },
    'translateX': { enabled: true, value: '0' },
    'translateY': { enabled: true, value: '0' },
    'rotate': { enabled: true, value: '0' }
  });

  function updateRule(ruleName, patch) {
    setRuleState(prev => ({
      ...prev,
      [ruleName]: { ...prev[ruleName], ...patch }
    }));
  }

  const [svgStyles, setSvgStyles] = useState([]);
  function toggleCollapsedUl(event) {
    if (event.target !== event.currentTarget) return;
    console.log('toggled collapse in: ', event.currentTarget);

    event.currentTarget.classList.toggle('collapsed');
  }
  
  // this will set a "global" variable that will "point" to the element that is being edited currently. It will be used by another function that will call the respective controller for the element.
  function selectElement(elId) {
    selectedElRef.current = elId; // sync immediately

    setSelectedEl(elId);
    console.log('selected element: ', elId);
    // const svgView = document.getElementById('svgView');
    // svgView.querySelectorAll('.selectedSvgElement').forEach(el => el.classList.remove('selectedSvgElement'));
    // const selectedElement = svgView.querySelector(`#${elId}`);
    // selectedElement && selectedElement.classList.add('selectedSvgElement');

  }

  

  async function changeRules() {
    const currentElId = selectedElRef.current;
  if (!currentElId) {
    alert('No element selected.');
    return;
  }

  const rulesToApply = Object.fromEntries(
    Object.entries(ruleState)
      .filter(([, config]) => config.enabled && config.value !== '')
      .map(([ruleName, config]) => [ruleName, config.value])
  );

  if (Object.keys(rulesToApply).length === 0) {
    alert('No rules to apply.');
    return;
  }

  setStylesByElementId(prev => ({
    ...prev,
    [currentElId]: {
      ...(prev[currentElId] || {}),
      ...rulesToApply
    }
  }));

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
  // this function goes through the array of rules and toggles the enabled property of the rule with the given id. It then updates the state with the new array of rules.
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

    const svgStyle = svgParsed.querySelector('style');
    console.log('SVG style: ', svgStyle);

    // We'll make a function that will be used recursively to check the elements inside other elements in the SVG. For example, it will be used to check insige a group and if this group has anopther group as a child it will execute the same function to see inside this child group. The data will be organized as an object with the parameters: tag, id, classList, contents (Array of objects with the same structure).



    let svgStructureArray = [];

    Array.from(svgParsed.querySelectorAll('svg > *')).forEach(element => {
      svgStructureArray.push(traverseElements(element));

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

    console.log('Styles after reading: ', svgStyles);
  svgStyles.forEach(rule => {
              console.log('rule:', rule, 'rule.id: ', rule.id);
  });

  reader.readAsText(file);
}

useEffect(() => {
  applyStylesToDom(stylesByElementId);
}, [stylesByElementId, svgDoc]);

useEffect(() => {
  // highlight selected element
  const svgView = document.getElementById('svgView');
  svgView?.querySelectorAll('.selectedSvgElement').forEach(el => el.classList.remove('selectedSvgElement'));
  const el = svgView?.querySelector(`#${CSS.escape(selectedEl)}`);
  el?.classList.add('selectedSvgElement');
}, [selectedEl, svgDoc]);

useEffect(() => {
  // rewrite style tags from svgStyles state
  const svgView = document.getElementById('svgView');
  svgView?.querySelectorAll('style').forEach((styleEl, sheetIdx) => {
    const sheetRules = svgStyles.filter(r => r.sheetIdx === sheetIdx && r.enabled);
    styleEl.innerHTML = sheetRules.map(r => r.cssText).join('\n');
  });
}, [svgStyles, svgDoc]);


return (
  <>
    <section id="appContainer">
      <div className="flexrow fullwidth flex1">
        <div id="elementList">
          Element List
          <span id="svgContents">
            <ul>
              {svgTree.map(node => (
                <TreeNode 
                key={node.id} 
                node={node} 
                selectedEl={selectedEl}
                onSelect={selectElement}
                />
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

          {RULES_CONFIG.map(rule => (
            rule.rule === 'transform' ? (
              <div key={rule.rule} className="ruleBox transformRuleGroup">
                <span className="ruleGroupLabel">{rule.label}</span>
                {rule.inputs.map(input => (
                  <RuleInputs 
                  key={input.rule} 
                  rule={input} 
                  state={ruleState[input.rule] ?? { enabled: true, value: '' }}
                  onUpdate={updateRule}
                  />
                ))}
              </div>
            ) : (
              <RuleInputs 
                key={rule.rule} 
                rule={rule} 
                state={ruleState[rule.rule] ?? { enabled: true, value: '' }}
                onUpdate={updateRule}
              />
            )
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
      <div className="timelineContainer">
            <input type="range" min="0" max="100" value={currentFrame} onChange={(e) => setCurrentFrame(parseInt(e.target.value))} />
      </div>
      {/* <div id="timelineContainer">
          Timeline Container
        </div> */}
    </section>
  </>
)
}

export default App
