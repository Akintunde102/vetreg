import{j as e}from"./jsx-runtime-B90IOHfR.js";import{c as l}from"./utils-CytzSlOG.js";import{c as d}from"./createLucideIcon-Bjhh8WGB.js";import{P as S}from"./paw-print-C890CBl-.js";import"./iframe-yJGoQm7m.js";import"./preload-helper-C1FmrZbK.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=d("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=d("DollarSign",[["line",{x1:"12",x2:"12",y1:"2",y2:"22",key:"7eqyqh"}],["path",{d:"M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",key:"1b0p4s"}]]);/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=d("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]);function k({icon:M,value:a,label:j,badge:r,variant:o="default",onClick:q}){return e.jsxs("button",{onClick:q,className:l("bg-card border border-border rounded-xl p-3 lg:p-4 text-center hover:shadow-md hover:border-primary/30 transition-all group relative flex flex-col items-center gap-1",o==="warning"&&"border-warning/20 bg-warning/5"),children:[r!==void 0&&r>0&&e.jsx("span",{className:"absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center",children:r}),e.jsx("div",{className:l("w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center",o==="warning"?"bg-warning/10":"bg-primary/10"),children:e.jsx(M,{className:l("w-5 h-5 lg:w-6 lg:h-6",o==="warning"?"text-warning":"text-primary")})}),e.jsx("p",{className:"text-xs text-muted-foreground mt-1 leading-tight",children:j}),typeof a=="string"&&a.startsWith("₦")?e.jsx("span",{className:"text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5",children:a}):r!==void 0&&r>0?null:e.jsx("span",{className:"text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5",children:a})]})}k.__docgenInfo={description:"",methods:[],displayName:"StatsWidget",props:{icon:{required:!0,tsType:{name:"LucideIcon"},description:""},value:{required:!0,tsType:{name:"union",raw:"number | string",elements:[{name:"number"},{name:"string"}]},description:""},label:{required:!0,tsType:{name:"string"},description:""},badge:{required:!1,tsType:{name:"number"},description:""},variant:{required:!1,tsType:{name:"union",raw:"'default' | 'warning'",elements:[{name:"literal",value:"'default'"},{name:"literal",value:"'warning'"}]},description:"",defaultValue:{value:"'default'",computed:!1}},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const z={title:"Dashboard/StatsWidget",component:k,tags:["autodocs"]},n={args:{icon:N,value:3,label:"Organizations"}},t={args:{icon:D,value:77,label:"Clients",badge:5}},s={args:{icon:W,value:"₦3.5M",label:"Revenue"}},i={args:{icon:S,value:3,label:"Follow-ups due",variant:"warning",badge:3}};var c,p,u;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    icon: Building2,
    value: 3,
    label: 'Organizations'
  }
}`,...(u=(p=n.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var m,g,h;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    icon: Users,
    value: 77,
    label: 'Clients',
    badge: 5
  }
}`,...(h=(g=t.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var y,x,f;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    icon: DollarSign,
    value: '₦3.5M',
    label: 'Revenue'
  }
}`,...(f=(x=s.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var b,v,w;i.parameters={...i.parameters,docs:{...(b=i.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    icon: PawPrint,
    value: 3,
    label: 'Follow-ups due',
    variant: 'warning',
    badge: 3
  }
}`,...(w=(v=i.parameters)==null?void 0:v.docs)==null?void 0:w.source}}};const C=["Default","WithBadge","Revenue","Warning"];export{n as Default,s as Revenue,i as Warning,t as WithBadge,C as __namedExportsOrder,z as default};
