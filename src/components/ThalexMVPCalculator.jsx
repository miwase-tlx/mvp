import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const INITIAL_STATE = {
  'BTC - D1': {
    feeTiers: {
      'MM - D1': { taker: 0.6, maker: 0.2 },
      'MM - Options': { taker: 0.6, maker: 0.6 },
      'Protail': { taker: 1.0, maker: 1.0 },
      'Retail': { taker: 2.5, maker: 2.5 }
    },
    volumes: {
      'MM - D1': { taker: 4.5, maker: 6.5 },
      'MM - Options': { taker: 13.2, maker: 0.3 },
      'Protail': { taker: 1.0, maker: 10.9 },
      'Retail': { taker: 0.0, maker: 0.0 }
    }
  },
  'ETH - D1': {
    feeTiers: {
      'MM - D1': { taker: 0.6, maker: 0.2 },
      'MM - Options': { taker: 0.6, maker: 0.6 },
      'Protail': { taker: 1.0, maker: 1.0 },
      'Retail': { taker: 2.5, maker: 2.5 }
    },
    volumes: {
      'MM - D1': { taker: 4.5, maker: 6.5 },
      'MM - Options': { taker: 13.2, maker: 0.3 },
      'Protail': { taker: 1.0, maker: 10.9 },
      'Retail': { taker: 0.0, maker: 0.0 }
    }
  },
  'BTC - Options': {
    feeTiers: {
      'MM - D1': { taker: 0.6, maker: 0.2 },
      'MM - Options': { taker: 0.6, maker: 0.6 },
      'Protail': { taker: 1.0, maker: 1.0 },
      'Retail': { taker: 2.5, maker: 2.5 }
    },
    volumes: {
      'MM - D1': { taker: 4.5, maker: 6.5 },
      'MM - Options': { taker: 13.2, maker: 0.3 },
      'Protail': { taker: 1.0, maker: 10.9 },
      'Retail': { taker: 0.0, maker: 0.0 }
    }
  },
  'ETH - Options': {
    feeTiers: {
      'MM - D1': { taker: 0.6, maker: 0.2 },
      'MM - Options': { taker: 0.6, maker: 0.6 },
      'Protail': { taker: 1.0, maker: 1.0 },
      'Retail': { taker: 2.5, maker: 2.5 }
    },
    volumes: {
      'MM - D1': { taker: 4.5, maker: 6.5 },
      'MM - Options': { taker: 13.2, maker: 0.3 },
      'Protail': { taker: 1.0, maker: 10.9 },
      'Retail': { taker: 0.0, maker: 0.0 }
    }
  }
};
const SCENARIOS = {
    'Base': (state) => state,
    'Retail growth': (state) => {
      const newState = JSON.parse(JSON.stringify(state));
      Object.keys(newState).forEach(asset => {
        const volumes = newState[asset].volumes;
        
        // Calculate total MM volumes
        const mmTakerVolume = volumes['MM - D1'].taker + volumes['MM - Options'].taker;
        const mmMakerVolume = volumes['MM - D1'].maker + volumes['MM - Options'].maker;
        
        // Reduce MM volumes by 30% total (10% to Protail, 20% to Retail)
        volumes['MM - D1'].taker *= 0.7;
        volumes['MM - D1'].maker *= 0.7;
        volumes['MM - Options'].taker *= 0.7;
        volumes['MM - Options'].maker *= 0.7;
        
        // Add 10% of original MM volumes to Protail
        volumes['Protail'].taker += mmTakerVolume * 0.1;
        volumes['Protail'].maker += mmMakerVolume * 0.1;
        
        // Add 20% of original MM volumes to Retail
        volumes['Retail'].taker += mmTakerVolume * 0.2;
        volumes['Retail'].maker += mmMakerVolume * 0.2;
      });
      return newState;
    },
    'Volume growth': (state) => {
      const newState = JSON.parse(JSON.stringify(state));
      Object.keys(newState).forEach(asset => {
        const volumes = newState[asset].volumes;
        Object.keys(volumes).forEach(group => {
          volumes[group].taker *= 1.4;
          volumes[group].maker *= 1.4;
        });
      });
      return newState;
    }
  };
  
  const SCENARIO_DESCRIPTIONS = {
    'Base': 'Current market state with no modifications',
    'Retail growth': 'Simulates shift of 30% MM volume to Retail (20%) and Protail (10%) traders',
    'Volume growth': 'All volumes increased by 40% while maintaining the same proportions'
  };
  
  const ThalexMVPCalculator = () => {
    const [selectedAsset, setSelectedAsset] = useState('BTC - D1');
    const [selectedScenario, setSelectedScenario] = useState('Base');
    const [baseState, setBaseState] = useState(INITIAL_STATE);
    const [totalRewards] = useState(2050);

const currentState = SCENARIOS[selectedScenario](baseState);

    const handleFeeChange = (group, type, value) => {
      setBaseState(prev => ({
        ...prev,
        [selectedAsset]: {
          ...prev[selectedAsset],
          feeTiers: {
            ...prev[selectedAsset].feeTiers,
            [group]: {
              ...prev[selectedAsset].feeTiers[group],
              [type]: Number(value) || 0
            }
          }
        }
      }));
    };
  
    const handleVolumeChange = (group, type, value) => {
      setBaseState(prev => ({
        ...prev,
        [selectedAsset]: {
          ...prev[selectedAsset],
          volumes: {
            ...prev[selectedAsset].volumes,
            [group]: {
              ...prev[selectedAsset].volumes[group],
              [type]: Number(value) || 0
            }
          }
        }
      }));
    };
  
    const calculateMetrics = (asset) => {
      const { feeTiers, volumes } = currentState[asset];
      let results = [];
      let totalTakerFees = 0;
      let totalMakerFees = 0;
  
      Object.entries(volumes).forEach(([group, { taker: takerVol, maker: makerVol }]) => {
        const takerFees = Math.round(takerVol * feeTiers[group].taker * 100);
        const makerFees = Math.round(makerVol * feeTiers[group].maker * 100);
        
        totalTakerFees += takerFees;
        totalMakerFees += makerFees;
        
        results.push({
          group,
          takerVolume: takerVol,
          makerVolume: makerVol,
          takerBps: feeTiers[group].taker,
          makerBps: feeTiers[group].maker,
          takerFees,
          makerFees,
          totalFees: takerFees + makerFees
        });
      });
  
      const totalFees = totalTakerFees + totalMakerFees;

      results = results.map(row => {
        const takerFeeShare = totalFees > 0 ? (row.takerFees / totalFees * 100) : 0;
        const makerFeeShare = totalFees > 0 ? (row.makerFees / totalFees * 100) : 0;
        const takerRewards = totalFees > 0 ? Math.round(row.takerFees / totalFees * totalRewards) : 0;
        const makerRewards = totalFees > 0 ? Math.round(row.makerFees / totalFees * totalRewards) : 0;
        
        const effectiveTakerRate = row.takerVolume > 0 ? 
          row.takerBps - (takerRewards / (row.takerVolume * 100)) : 0;
        const effectiveMakerRate = row.makerVolume > 0 ? 
          row.makerBps - (makerRewards / (row.makerVolume * 100)) : 0;
  
        return {
          ...row,
          takerFeeShare,
          makerFeeShare,
          takerRewards,
          makerRewards,
          effectiveTakerRate,
          effectiveMakerRate
        };
      });
  
      return {
        rows: results,
        totals: {
          takerVolume: Object.values(volumes).reduce((a, b) => a + b.taker, 0),
          makerVolume: Object.values(volumes).reduce((a, b) => a + b.maker, 0),
          takerFees: totalTakerFees,
          makerFees: totalMakerFees,
          totalFees,
          takerRewards: results.reduce((acc, row) => acc + row.takerRewards, 0),
          makerRewards: results.reduce((acc, row) => acc + row.makerRewards, 0)
        }
      };
    };
  
    const metrics = calculateMetrics(selectedAsset);
return (
        <div className="space-y-4 p-4 bg-gray-50 min-h-screen">
          <Card className="border-t-4 border-t-blue-800">
            <CardHeader className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
              <CardTitle className="flex justify-between items-center">
                <span className="text-xl font-bold">Thalex MVP Calculator</span>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Scenario:</span>
                    <select
                      value={selectedScenario}
                      onChange={(e) => setSelectedScenario(e.target.value)}
                      className="border rounded px-2 py-1 text-black bg-white"
                    >
                      {Object.keys(SCENARIOS).map(scenario => (
                        <option key={scenario} value={scenario}>{scenario}</option>
                      ))}
                    </select>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-64">{SCENARIO_DESCRIPTIONS[selectedScenario]}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2">
                    <span className="text-sm font-medium">Total Rewards ($):</span>
                    <input
                      type="number"
                      value={totalRewards}
                      disabled
                      className="border rounded px-2 py-1 w-20 text-right text-black bg-gray-100"
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-8">
              <Tabs value={selectedAsset} onValueChange={setSelectedAsset} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="BTC - D1">BTC - D1</TabsTrigger>
                  <TabsTrigger value="ETH - D1">ETH - D1</TabsTrigger>
                  <TabsTrigger value="BTC - Options">BTC - Options</TabsTrigger>
                  <TabsTrigger value="ETH - Options">ETH - Options</TabsTrigger>
                </TabsList>
                {Object.keys(currentState).map(asset => (
              <TabsContent key={asset} value={asset}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        <th className="px-4 py-3 text-left rounded-tl-lg">Fee Tier</th>
                        <th className="px-4 py-3">Taker volume (mln)</th>
                        <th className="px-4 py-3">Taker fee rate (bps)</th>
                        <th className="px-4 py-3">Maker volume (mln)</th>
                        <th className="px-4 py-3">Maker fee rate (bps)</th>
                        <th className="px-4 py-3">Taker fees</th>
                        <th className="px-4 py-3">Maker fees</th>
                        <th className="px-4 py-3">Total fees</th>
                        <th className="px-4 py-3">Taker fees (% share)</th>
                        <th className="px-4 py-3">Maker fees (% share)</th>
                        <th className="px-4 py-3">Taker rewards</th>
                        <th className="px-4 py-3 rounded-tr-lg">Maker rewards</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.rows.map((row, idx) => (
                        <tr key={row.group} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="px-4 py-3 font-medium">{row.group}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={currentState[asset].volumes[row.group].taker}
                              onChange={(e) => handleVolumeChange(row.group, 'taker', e.target.value)}
                              disabled={selectedScenario !== 'Base'}
                              className="border rounded px-2 py-1 w-16 text-right bg-white"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.1"
                              value={currentState[asset].feeTiers[row.group].taker}
                              onChange={(e) => handleFeeChange(row.group, 'taker', e.target.value)}
                              className="border rounded px-2 py-1 w-16 text-right bg-white"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={currentState[asset].volumes[row.group].maker}
                              onChange={(e) => handleVolumeChange(row.group, 'maker', e.target.value)}
                              disabled={selectedScenario !== 'Base'}
                              className="border rounded px-2 py-1 w-16 text-right bg-white"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              step="0.1"
                              value={currentState[asset].feeTiers[row.group].maker}
                              onChange={(e) => handleFeeChange(row.group, 'maker', e.target.value)}
                              className="border rounded px-2 py-1 w-16 text-right bg-white"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">${row.takerFees}</td>
                          <td className="px-4 py-3 text-right">${row.makerFees}</td>
                          <td className="px-4 py-3 text-right">${row.totalFees}</td>
                          <td className="px-4 py-3 text-right">{Math.round(row.takerFeeShare)}%</td>
                          <td className="px-4 py-3 text-right">{Math.round(row.makerFeeShare)}%</td>
                          <td className="px-4 py-3 text-right">${row.takerRewards}</td>
                          <td className="px-4 py-3 text-right">${row.makerRewards}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-blue-900 text-white">
                        <td className="px-4 py-3 rounded-bl-lg">Total</td>
                        <td className="px-4 py-3 text-right">{metrics.totals.takerVolume.toFixed(1)}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right">{metrics.totals.makerVolume.toFixed(1)}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right">${metrics.totals.takerFees}</td>
                        <td className="px-4 py-3 text-right">${metrics.totals.makerFees}</td>
                        <td className="px-4 py-3 text-right">${metrics.totals.totalFees}</td>
                        <td className="px-4 py-3 text-right">{Math.round(metrics.totals.takerFees / metrics.totals.totalFees * 100)}%</td>
                        <td className="px-4 py-3 text-right">{Math.round(metrics.totals.makerFees / metrics.totals.totalFees * 100)}%</td>
                        <td className="px-4 py-3 text-right">${metrics.totals.takerRewards}</td>
                        <td className="px-4 py-3 text-right rounded-br-lg">${metrics.totals.makerRewards}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-12">
                    <h3 className="font-bold text-lg text-blue-900 mb-4">Net Fee Rates</h3>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-blue-900 text-white">
                          <th className="px-4 py-3 text-left rounded-tl-lg">Fee Tier</th>
                          <th className="px-4 py-3 rounded-none text-center">Net Taker Fee (bps)</th>
                          <th className="px-4 py-3 rounded-tr-lg text-center">Net Maker Fee (bps)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.rows.map((row, idx) => (
                          <tr key={row.group} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                            <td className="px-4 py-3 font-medium">{row.group}</td>
                            <td className="px-4 py-3 text-center">{row.effectiveTakerRate.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">{row.effectiveMakerRate.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThalexMVPCalculator;