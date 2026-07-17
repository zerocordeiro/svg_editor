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
        this.keyframes = [
            {time:0, transformRotate:0, transformTranslate:0, strokeWidth:10, strokeColor:'black'}, 
            {time:25, transformRotate:10, transformTranslate:10, strokeWidth:20, strokeColor:'red'}, 
            {time:50, transformRotate:20, transformTranslate:20, strokeWidth:1, strokeColor:'blue'}, 
            {time:75, transformRotate:30, transformTranslate:-10, strokeWidth:20, strokeColor:'green'}, 
            {time:100, transformRotate:0, transformTranslate:0, strokeWidth:1, strokeColor:'black'}
        ]; 
        this.keyframes=[];
        /** example keyframes, to test how the building will work. the keyframes need to be updated every time a new time is added to the animation. By keeping the values inside the controller, we can go through all of them every time we need to update the animation. 
        The keyframes will be used to build the css rules for the element or group. The keyframes will be an array of objects with the following structure: 
            {time: number, 
            transformRotate: number, 
            transformTranslate: number, 
            strokeWidth: number, 
            strokeColor: string}. 
        - The time will be a percentage of the total animation time. 
        - The transformRotate and transformTranslate will be used to build the transform property of the element or group. 
        - The strokeWidth and strokeColor will be used to build the stroke property of the element or group.
        */
    }
    init() {
        // Initialization code here
        //document.querySelector('#svgContents').appendChild(this.button);
        // this.changeStroke();
    }
    setStroke(color, width){
        this.element.setAttribute('stroke', color);
        this.element.setAttribute('stroke-width', width);
    }
    getStroke(){
        return {
            color: this.element.getAttribute('stroke'),
            strokeWidth: this.element.getAttribute('stroke-width')
        }
    }
    setKeyframes(keyframes) {
        this.keyframes = keyframes;

    }
    

    changeCssRules(rulesArray, rulesToApply) {
        const liveEl = document.getElementById(this.element.id);
            if (liveEl) {
                this.element = liveEl;
            }

        // rulesArray is an Array of objects, each one containing a rule to be applied. Rules to Apply is an object like a dictionary, with the rule name as the key and the value to be applied as the value. For example: rulesToApply = {strokeWidth: 5, strokeColor: 'red'}. The rulesArray will be an array of objects with the following structure: {rule: 'strokeWidth', inputId: 'ruleInputStrokeWidth'}, {rule: 'strokeColor', inputId: 'ruleInputStrokeColor'}. The inputId is the id of the input element that will be used to get the value to be applied. The rule is the name of the rule that will be applied. The rulesArray will be used to get the values from the inputs and apply them to the element or group.
        rulesArray.forEach(rule => {
            const value = rulesToApply[rule.rule];
            if (value !== undefined && value !== '') {
                this.element.style.setProperty(rule.rule, value); // reliable for stroke-width
                console.log(`Rule ${rule.rule} applied with value: ${value}`);
            }
        });
        
        !this.element.querySelector('style') && this.element.appendChild(document.createElement('style'));
        const elStyle = this.element.querySelector('style');

        // get the classlist array for this element and make a string with all the classes separated by a dot, so we can use it as a selector in the css. If the element has no classes, we will use just the id as a selector.
        const elClasses = this.element.classList.length > 0 ? '.' + Array.from(this.element.classList).join('.') : '';

        const elAnimCss = `#${this.element.id}${elClasses} { 
            animation-name: ${this.element.id}_anim;
            transform-origin: center;
            animation-duration: 5s;
            animation-timing-function: linear;
            animation-iteration-count: 1;
            animation-play-state: running;
            }
            @keyframes ${this.element.id}_anim {
                ${this.keyframes.map(keyframe => `
                ${keyframe.time}% {
                    transform: rotate(${keyframe.transformRotate}deg) translate(${keyframe.transformTranslate}px);
                    stroke-width: ${keyframe.strokeWidth}px;
                    stroke: ${keyframe.strokeColor};
                }`).join('')}
            }`;
        elStyle.type = 'text/css';
        elStyle.innerHTML = elAnimCss;

        // if (elStyle.styleSheet) {
        //     elStyle.styleSheet.cssText = elAnimCss;
        // } else {
        //     elStyle.appendChild(document.createTextNode(elAnimCss));
        // }

        //this.element.setAttribute('stroke', 'red');
        //this.element.setAttribute('stroke-width', '2px');
    }
}
let elCounter = 0;
function traverseElements(element, registerSvgController, selectElement) {
    const elementData = {};
    //const currentDate = await new Date().getTime();

    elementData['tag'] = element.tagName;
    elementData.id = element.id ? element.id : `el_${element.tagName.toLowerCase()}_${elCounter++}`;
    if(!element.id) {
        element.id = elementData.id; // Assign a unique ID if it doesn't have one
    }
    elementData['classList'] = Array.from(element.classList);
    elementData.children = [];
    for (const child of Array.from(element.children)) {
            // console.log('group found: ', child);
            elementData.children.push(traverseElements(child, registerSvgController, selectElement)); // Recursively traverse child elements
    }
    const myController = new svgElementController(element, elementData.id);
    myController.init();

    const elBtn = document.createElement('button');
    elBtn.setAttribute('data-elId', elementData.id);

    elBtn.innerHTML = `${elementData.tag}: ${elementData.id}`;

    document.querySelector('#svgContents').appendChild(elBtn);
    console.log('added a button for element: ', elementData.id);

    elBtn.addEventListener('click', () => {
        selectElement(elementData.id);
    })
    console.log('🕵️ myController: ', myController);

    registerSvgController(elementData.id, myController);

    return elementData;
}

export default traverseElements;