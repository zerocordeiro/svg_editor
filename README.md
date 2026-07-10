# About
This is a SVG animation editor - currently work in progress as a side project, motivated by some recent work-related need to animate SVGs "manually" and the lack of a free online SVG editor 
The objective is to make an easy to use editor similar to video editing software, but focusing on SVGs and the use of CSS animation properties, which can be embedded in the SVG so that it can be imported in any compatible webpage or software.

The starting point for this is reading the SVG and distributing its elements properly, i.e. organizing groups and elements so that they can be displayed in a simple enough interface that the user will be able to "read" the SVG as if it is a multiplayered vector (which it is). 
Then, there should be a timeline and options that will let the user asign animations to each element of the SVG. To make this possible, when the SVG is loaded each group and element should be assinged an ID (if they don't have one already), and then they will be assigned animations.

This readme will be edited as work goes on. 

# Running project

npx i to install dependencies

npx vite (optional --host) to run server
