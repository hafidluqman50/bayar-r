import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Overview',
    },
    {
      type: 'doc',
      id: 'story',
      label: 'Problem Context and Rationale',
    },
    {
      type: 'doc',
      id: 'product',
      label: 'Product Experience',
    },
    {
      type: 'doc',
      id: 'architecture',
      label: 'Architecture',
    },
    {
      type: 'doc',
      id: 'contracts',
      label: 'Smart Contracts',
    },
    {
      type: 'doc',
      id: 'guide',
      label: 'Build and Run',
    },
    {
      type: 'doc',
      id: 'roadmap',
      label: 'Roadmap',
    },
  ],
};

export default sidebars;
