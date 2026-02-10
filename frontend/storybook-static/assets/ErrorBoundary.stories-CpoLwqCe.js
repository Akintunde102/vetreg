var v=Object.defineProperty;var E=(s,e,t)=>e in s?v(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var c=(s,e,t)=>E(s,typeof e!="symbol"?e+"":e,t);import{j as r}from"./jsx-runtime-B90IOHfR.js";import{r as N}from"./iframe-yJGoQm7m.js";import{B as k}from"./button-C3DdFAn1.js";import{c as j}from"./createLucideIcon-Bjhh8WGB.js";import"./preload-helper-C1FmrZbK.js";import"./utils-CytzSlOG.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=j("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);class f extends N.Component{constructor(){super(...arguments);c(this,"state",{hasError:!1})}static getDerivedStateFromError(t){return{hasError:!0,error:t}}componentDidCatch(t,y){console.error("ErrorBoundary caught:",t,y)}render(){return this.state.hasError&&this.state.error?this.props.fallback?this.props.fallback:r.jsxs("div",{className:"min-h-[200px] flex flex-col items-center justify-center p-8 bg-destructive/5 border border-destructive/20 rounded-xl",children:[r.jsx(w,{className:"w-12 h-12 text-destructive mb-4"}),r.jsx("h3",{className:"font-semibold text-foreground mb-2",children:"Something went wrong"}),r.jsx("p",{className:"text-sm text-muted-foreground mb-4 text-center max-w-md",children:this.state.error.message}),r.jsx(k,{variant:"outline",onClick:()=>this.setState({hasError:!1,error:void 0}),children:"Try again"})]}):this.props.children}}f.__docgenInfo={description:"",methods:[],displayName:"ErrorBoundary",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},fallback:{required:!1,tsType:{name:"ReactNode"},description:""}}};const b=()=>{throw new Error("Story error")},R={title:"Feedback/ErrorBoundary",component:f,tags:["autodocs"]},o={args:{children:r.jsx("div",{className:"p-4 bg-muted rounded",children:"Child content (no error)"})}},a={args:{children:r.jsx(b,{})}},n={args:{children:r.jsx(b,{}),fallback:r.jsxs("div",{className:"p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center",children:[r.jsx("p",{className:"font-semibold text-destructive",children:"Custom fallback message"}),r.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"Something went wrong in this story."})]})}};var d,i,l;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    children: <div className="p-4 bg-muted rounded">Child content (no error)</div>
  }
}`,...(l=(i=o.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var m,u,p;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    children: <Throw />
  }
}`,...(p=(u=a.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var h,x,g;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    children: <Throw />,
    fallback: <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center">
        <p className="font-semibold text-destructive">Custom fallback message</p>
        <p className="text-sm text-muted-foreground mt-1">Something went wrong in this story.</p>
      </div>
  }
}`,...(g=(x=n.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};const A=["NoError","WithError","CustomFallback"];export{n as CustomFallback,o as NoError,a as WithError,A as __namedExportsOrder,R as default};
