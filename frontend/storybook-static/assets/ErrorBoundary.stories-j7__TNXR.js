var E=Object.defineProperty;var N=(s,e,t)=>e in s?E(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var c=(s,e,t)=>N(s,typeof e!="symbol"?e+"":e,t);import{j as r}from"./jsx-runtime-DIug4HNn.js";import{r as j}from"./iframe-D2ZKuysy.js";import{B as w}from"./button-BZIT_nLQ.js";import{C as y}from"./circle-alert-aMkGUVHE.js";import"./preload-helper-C1FmrZbK.js";import"./utils-CytzSlOG.js";import"./createLucideIcon-RyC5lW3z.js";class f extends j.Component{constructor(){super(...arguments);c(this,"state",{hasError:!1})}static getDerivedStateFromError(t){return{hasError:!0,error:t}}componentDidCatch(t,v){console.error("ErrorBoundary caught:",t,v)}render(){return this.state.hasError&&this.state.error?this.props.fallback?this.props.fallback:r.jsxs("div",{className:"min-h-[200px] flex flex-col items-center justify-center p-8 bg-destructive/5 border border-destructive/20 rounded-xl",children:[r.jsx(y,{className:"w-12 h-12 text-destructive mb-4"}),r.jsx("h3",{className:"font-semibold text-foreground mb-2",children:"Something went wrong"}),r.jsx("p",{className:"text-sm text-muted-foreground mb-4 text-center max-w-md",children:this.state.error.message}),r.jsx(w,{variant:"outline",onClick:()=>this.setState({hasError:!1,error:void 0}),children:"Try again"})]}):this.props.children}}f.__docgenInfo={description:"",methods:[],displayName:"ErrorBoundary",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},fallback:{required:!1,tsType:{name:"ReactNode"},description:""}}};const b=()=>{throw new Error("Story error")},q={title:"Feedback/ErrorBoundary",component:f,tags:["autodocs"]},o={args:{children:r.jsx("div",{className:"p-4 bg-muted rounded",children:"Child content (no error)"})}},a={args:{children:r.jsx(b,{})}},n={args:{children:r.jsx(b,{}),fallback:r.jsxs("div",{className:"p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center",children:[r.jsx("p",{className:"font-semibold text-destructive",children:"Custom fallback message"}),r.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:"Something went wrong in this story."})]})}};var d,i,m;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    children: <div className="p-4 bg-muted rounded">Child content (no error)</div>
  }
}`,...(m=(i=o.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};var l,u,p;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(g=(x=n.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};const D=["NoError","WithError","CustomFallback"];export{n as CustomFallback,o as NoError,a as WithError,D as __namedExportsOrder,q as default};
