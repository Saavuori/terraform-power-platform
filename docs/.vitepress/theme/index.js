import { defineAsyncComponent, h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import '@fontsource-variable/archivo/wdth.css'
import '@fontsource-variable/atkinson-hyperlegible-next'
import '@fontsource-variable/jetbrains-mono'
import './style.css'

import TypeHeader from './components/TypeHeader.vue'
import RelationDiagram from './components/RelationDiagram.vue'
import OpenInBuilder from './components/OpenInBuilder.vue'
import LayerLegend from './components/LayerLegend.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('TypeHeader', TypeHeader)
    app.component('RelationDiagram', RelationDiagram)
    app.component('OpenInBuilder', OpenInBuilder)
    app.component('LayerLegend', LayerLegend)
    // heavier, page-specific components load on demand
    app.component('Builder', defineAsyncComponent(() => import('./components/Builder.vue')))
    app.component('RelationshipMap', defineAsyncComponent(() => import('./components/RelationshipMap.vue')))
    app.component('HomePage', defineAsyncComponent(() => import('./components/HomePage.vue')))
    app.component('ReferenceIndex', defineAsyncComponent(() => import('./components/ReferenceIndex.vue')))
    app.component('PatternFigure', defineAsyncComponent(() => import('./components/PatternFigure.vue')))
    app.component('ApiMatrix', defineAsyncComponent(() => import('./components/ApiMatrix.vue')))
    app.component('FlowFigure', defineAsyncComponent(() => import('./components/FlowFigure.vue')))
  },
}
