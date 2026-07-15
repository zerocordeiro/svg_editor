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
            {time:0, transformRotate:0, transformTranslate:0, strokeWidth:1, strokeColor:'black'}, 
            {time:25, transformRotate:10, transformTranslate:10, strokeWidth:20, strokeColor:'red'}, 
            {time:50, transformRotate:20, transformTranslate:20, strokeWidth:1, strokeColor:'blue'}, 
            {time:75, transformRotate:30, transformTranslate:-10, strokeWidth:20, strokeColor:'green'}, 
            {time:100, transformRotate:0, transformTranslate:0, strokeWidth:1, strokeColor:'black'}
        ]; 
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
    

    changeCssRules() {
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
            animation-duration: 5s;
            animation-timing-function: linear;
            animation-iteration-count: 1;
            animation-play-state: paused;
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

async function traverseElements(element, setSvgControllers, selectElement) {
    const elementData = {};
    const currentDate = await new Date().getTime();

    elementData.tag = element.tagName;
    elementData.id = element.id ? element.id : currentDate;
    elementData.classList = Array.from(element.classList);
    elementData.children = [];
    for (const child of Array.from(element.children)) {
        if (child.tagName === 'g') {
            // console.log('group found: ', child);
            elementData.children.push(await traverseElements(child, setSvgControllers, selectElement)); // Recursively traverse child elements

        } else {
            // console.log('element found: ', child);
            elementData.children.push({
                tag: child.tagName,
                id: child.id ? child.id : currentDate,
                classList: Array.from(child.classList),
                children: []
            });
            // document.querySelector('#svgContentsList').innerHTML += `<li>Element: ${child.tagName}, ID: ${child.id ? child.id : 'noId'}, Classes: ${Array.from(child.classList).join(', ')}</li>`;
        }
    }
    const myController = new svgElementController(element, elementData.id);
    myController.init();

    const elBtn = document.createElement('button');
    elBtn.setAttribute('da-elId', elementData.id);

    elBtn.innerHTML = `${elementData.id}`;

    document.querySelector('#elementList').appendChild(elBtn);

    elBtn.addEventListener('click', () => {
        selectElement(elementData.id);
    })
    console.log('🕵️ myController: ', myController);

    setSvgControllers(prevControllers => ({
        ...prevControllers,
        [elementData.id]: myController
    }));
    return elementData;
}

export default traverseElements;