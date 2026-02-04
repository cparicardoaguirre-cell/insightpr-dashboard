import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface Ratio {
    name: string;
    current: number;
    prior: number | string;
    benchmark?: string;
    unit?: string;
    formula?: string;
    explanation?: string;
    status?: string;
    recommendations?: string[];
    perspectives?: {
        fiscal: string;
        bank: string;
        manufacturer: string;
        investor: string;
    };
    // Industry benchmark data from Python extraction
    industryBenchmark?: number;
    industryLabel?: string;
}

interface FinancialRatiosSectionProps {
    fsRatios: {
        company: string;
        asOf: string;
        source: string;
        solvencyRatios?: Ratio[];
        profitabilityRatios?: Ratio[];
        safetyRatios?: Ratio[];
        assetManagementRatios?: Ratio[];
        leadingIndicators?: Ratio[];
    };
}

// Generate dynamic analysis based on ratio data
const generateRatioAnalysis = (ratio: Ratio, language: string) => {
    const name = ratio.name.toLowerCase();
    const current = ratio.current;
    const industry = ratio.industryBenchmark;
    const isAbove = industry ? current >= industry : true;
    const percentDiff = industry ? ((current - industry) / industry * 100).toFixed(1) : '0';

    // Ratio definitions and formulas
    const definitions: Record<string, { formula: string; explanation: { en: string; es: string } }> = {
        'current ratio': {
            formula: 'Current Assets / Current Liabilities',
            explanation: {
                en: 'Measures the company\'s ability to pay short-term obligations with its current assets. A ratio above 1 indicates more assets than liabilities.',
                es: 'Mide la capacidad de la empresa para pagar obligaciones a corto plazo con sus activos corrientes. Un ratio mayor a 1 indica más activos que pasivos.'
            }
        },
        'quick ratio': {
            formula: '(Current Assets - Inventory) / Current Liabilities',
            explanation: {
                en: 'Also known as acid-test ratio, measures immediate liquidity excluding inventory. More conservative than current ratio.',
                es: 'También conocido como prueba ácida, mide la liquidez inmediata excluyendo inventario. Más conservador que el ratio corriente.'
            }
        },
        'debt to equity': {
            formula: 'Total Debt / Total Equity',
            explanation: {
                en: 'Indicates how much debt the company uses to finance its assets relative to shareholder equity. Lower is generally better.',
                es: 'Indica cuánta deuda usa la empresa para financiar sus activos en relación al capital. Menor es generalmente mejor.'
            }
        },
        'debt ratio': {
            formula: 'Total Debt / Total Assets',
            explanation: {
                en: 'Shows the proportion of assets financed by debt. A ratio below 0.5 is considered conservative.',
                es: 'Muestra la proporción de activos financiados por deuda. Un ratio menor a 0.5 se considera conservador.'
            }
        },
        'return on assets': {
            formula: 'Net Income / Total Assets',
            explanation: {
                en: 'Measures how efficiently the company uses its assets to generate profit. Higher indicates better asset utilization.',
                es: 'Mide qué tan eficientemente la empresa usa sus activos para generar ganancias. Mayor indica mejor utilización.'
            }
        },
        'return on equity': {
            formula: 'Net Income / Shareholders\' Equity',
            explanation: {
                en: 'Shows return generated on shareholder investment. Key metric for investors evaluating management effectiveness.',
                es: 'Muestra el retorno generado sobre la inversión de los accionistas. Métrica clave para evaluar efectividad gerencial.'
            }
        },
        'net profit margin': {
            formula: 'Net Income / Revenue',
            explanation: {
                en: 'Percentage of revenue that becomes profit after all expenses. Indicates overall profitability.',
                es: 'Porcentaje de ingresos que se convierte en ganancia después de todos los gastos. Indica rentabilidad general.'
            }
        },
        'gross profit margin': {
            formula: '(Revenue - Cost of Goods Sold) / Revenue',
            explanation: {
                en: 'Shows the percentage of revenue remaining after direct costs. Indicates pricing power and production efficiency.',
                es: 'Muestra el porcentaje de ingresos restante después de costos directos. Indica poder de precios y eficiencia productiva.'
            }
        },
        'inventory turnover': {
            formula: 'Cost of Goods Sold / Average Inventory',
            explanation: {
                en: 'How many times inventory is sold and replaced in a period. Higher indicates efficient inventory management.',
                es: 'Cuántas veces se vende y reemplaza el inventario en un período. Mayor indica gestión eficiente de inventario.'
            }
        },
        'asset turnover': {
            formula: 'Revenue / Total Assets',
            explanation: {
                en: 'Measures revenue generated per dollar of assets. Indicates how efficiently assets are used to generate sales.',
                es: 'Mide los ingresos generados por dólar de activos. Indica qué tan eficientemente se usan los activos para ventas.'
            }
        }
    };

    // Find matching definition
    let matchedDef = { formula: 'N/A', explanation: { en: 'Financial ratio measuring company performance.', es: 'Ratio financiero que mide el rendimiento de la empresa.' } };
    for (const key in definitions) {
        if (name.includes(key)) {
            matchedDef = definitions[key];
            break;
        }
    }

    // Generate recommendations based on status
    const generateRecommendations = () => {
        const status = ratio.status;
        const recs: { en: string[]; es: string[] } = { en: [], es: [] };

        if (status === 'danger') {
            recs.en = [
                `Current ${ratio.name} is ${Math.abs(Number(percentDiff))}% ${isAbove ? 'above' : 'below'} industry benchmark`,
                'Immediate attention required - review contributing factors',
                'Consider operational changes to improve this metric',
                'Consult with financial advisors for strategic planning'
            ];
            recs.es = [
                `El ${ratio.name} actual está ${Math.abs(Number(percentDiff))}% ${isAbove ? 'por encima' : 'por debajo'} del benchmark de la industria`,
                'Requiere atención inmediata - revisar factores contribuyentes',
                'Considerar cambios operacionales para mejorar esta métrica',
                'Consultar con asesores financieros para planificación estratégica'
            ];
        } else if (status === 'warning') {
            recs.en = [
                `Monitor closely - ${ratio.name} is approaching concerning levels`,
                'Identify trends and potential causes',
                'Develop contingency plans for improvement'
            ];
            recs.es = [
                `Monitorear de cerca - el ${ratio.name} se acerca a niveles preocupantes`,
                'Identificar tendencias y causas potenciales',
                'Desarrollar planes de contingencia para mejora'
            ];
        } else {
            recs.en = [
                `${ratio.name} is performing ${isAbove ? 'above' : 'at'} industry standards`,
                'Maintain current operational strategies',
                'Continue monitoring for market changes'
            ];
            recs.es = [
                `El ${ratio.name} está ${isAbove ? 'por encima de' : 'en'} los estándares de la industria`,
                'Mantener las estrategias operacionales actuales',
                'Continuar monitoreando cambios del mercado'
            ];
        }
        return recs;
    };

    // Industry analysis
    const industryAnalysis = {
        en: industry ? `Compared to the ${ratio.industryLabel || 'industry benchmark'} of ${industry.toFixed(2)}, your company is ${isAbove ? 'outperforming' : 'underperforming'} by ${Math.abs(Number(percentDiff))}%. ${isAbove ? 'This indicates strong performance in this area.' : 'Consider strategies to improve this metric.'}` : 'No industry benchmark available for comparison.',
        es: industry ? `Comparado con el ${ratio.industryLabel || 'benchmark de la industria'} de ${industry.toFixed(2)}, su empresa está ${isAbove ? 'superando' : 'por debajo de'} por ${Math.abs(Number(percentDiff))}%. ${isAbove ? 'Esto indica un rendimiento sólido en esta área.' : 'Considere estrategias para mejorar esta métrica.'}` : 'No hay benchmark de la industria disponible para comparación.'
    };

    // Generate stakeholder perspectives based on ratio type and performance
    const generateStakeholderPerspectives = () => {
        const status = ratio.status;
        const isGood = status === 'good';
        const isWarning = status === 'warning';
        const ratioName = ratio.name;
        const val = current.toFixed(2);
        const indVal = industry?.toFixed(2) || 'N/A';

        // Bank/Lender Perspective
        const bankPerspective = {
            en: {
                title: '🏦 Bank / Lender Perspective',
                analysis: name.includes('current') || name.includes('quick') || name.includes('liquidity')
                    ? `${isGood ? 'Favorable for credit applications.' : isWarning ? 'May require additional collateral.' : 'Loan approval may be challenging.'} Banks evaluate ${ratioName} (${val}) to assess short-term debt repayment capacity. ${isAbove ? 'This ratio exceeds industry standards, indicating lower credit risk.' : 'Below industry benchmark may result in higher interest rates or stricter covenants.'}`
                    : name.includes('debt') || name.includes('leverage')
                        ? `${isGood ? 'Strong debt management signals creditworthiness.' : isWarning ? 'Moderate leverage requires monitoring.' : 'High leverage may limit borrowing capacity.'} Lenders assess ${ratioName} (${val} vs industry ${indVal}) to determine risk exposure. ${isAbove ? 'Current levels may allow for additional financing.' : 'May need to reduce debt before new credit facilities.'}`
                        : name.includes('profit') || name.includes('margin')
                            ? `${isGood ? 'Demonstrates strong cash flow generation for debt service.' : 'Profitability concerns may affect loan terms.'} Banks consider ${ratioName} (${val}) as indicator of ability to service debt obligations.`
                            : `Banks evaluate ${ratioName} (${val}) when assessing overall financial health. ${isGood ? 'Current performance supports favorable lending terms.' : 'May require enhanced documentation for credit applications.'}`
            },
            es: {
                title: '🏦 Perspectiva del Banco / Prestamista',
                analysis: name.includes('current') || name.includes('quick') || name.includes('liquidity')
                    ? `${isGood ? 'Favorable para solicitudes de crédito.' : isWarning ? 'Puede requerir garantías adicionales.' : 'La aprobación del préstamo puede ser difícil.'} Los bancos evalúan ${ratioName} (${val}) para evaluar la capacidad de pago de deuda a corto plazo. ${isAbove ? 'Este ratio excede los estándares de la industria, indicando menor riesgo crediticio.' : 'Por debajo del benchmark de la industria puede resultar en tasas de interés más altas o convenios más estrictos.'}`
                    : name.includes('debt') || name.includes('leverage')
                        ? `${isGood ? 'Una gestión sólida de deuda señala solvencia.' : isWarning ? 'El apalancamiento moderado requiere monitoreo.' : 'El alto apalancamiento puede limitar la capacidad de endeudamiento.'} Los prestamistas evalúan ${ratioName} (${val} vs industria ${indVal}) para determinar la exposición al riesgo. ${isAbove ? 'Los niveles actuales pueden permitir financiamiento adicional.' : 'Puede necesitar reducir deuda antes de nuevas líneas de crédito.'}`
                        : name.includes('profit') || name.includes('margin')
                            ? `${isGood ? 'Demuestra fuerte generación de flujo de caja para servicio de deuda.' : 'Las preocupaciones de rentabilidad pueden afectar los términos del préstamo.'} Los bancos consideran ${ratioName} (${val}) como indicador de capacidad para cumplir obligaciones de deuda.`
                            : `Los bancos evalúan ${ratioName} (${val}) al evaluar la salud financiera general. ${isGood ? 'El rendimiento actual apoya términos de préstamo favorables.' : 'Puede requerir documentación mejorada para solicitudes de crédito.'}`
            }
        };

        // Fiscal/Tax Perspective
        const fiscalPerspective = {
            en: {
                title: '📋 Fiscal / Tax Perspective',
                analysis: name.includes('profit') || name.includes('margin') || name.includes('income')
                    ? `${ratioName} (${val}) directly impacts taxable income. ${isGood ? 'Strong margins suggest higher tax liability - consider tax planning strategies like equipment depreciation or R&D credits.' : 'Lower margins reduce tax burden but may indicate operational issues.'} Current performance vs industry (${indVal}) ${isAbove ? 'may attract tax audit attention' : 'is within normal ranges for tax purposes'}.`
                    : name.includes('asset') || name.includes('turnover') || name.includes('inventory')
                        ? `${ratioName} affects asset depreciation schedules and inventory valuation for tax purposes. ${isGood ? 'Efficient asset utilization maximizes depreciation benefits.' : 'Slow turnover may require inventory write-downs affecting taxable income.'} Consider Section 179 deductions or bonus depreciation for equipment upgrades.`
                        : name.includes('debt')
                            ? `Interest expenses from debt are tax-deductible. ${ratioName} (${val}) indicates ${isGood ? 'balanced use of debt tax shield' : 'potential to optimize capital structure for tax efficiency'}. Consult tax advisor on debt restructuring opportunities.`
                            : `${ratioName} (${val}) has indirect tax implications through its effect on overall profitability and cash flow available for estimated tax payments.`
            },
            es: {
                title: '📋 Perspectiva Fiscal / Tributaria',
                analysis: name.includes('profit') || name.includes('margin') || name.includes('income')
                    ? `${ratioName} (${val}) impacta directamente el ingreso gravable. ${isGood ? 'Márgenes fuertes sugieren mayor responsabilidad tributaria - considere estrategias de planificación fiscal como depreciación de equipo o créditos de I+D.' : 'Márgenes menores reducen la carga tributaria pero pueden indicar problemas operacionales.'} El rendimiento actual vs industria (${indVal}) ${isAbove ? 'puede atraer atención de auditoría fiscal' : 'está dentro de rangos normales para propósitos tributarios'}.`
                    : name.includes('asset') || name.includes('turnover') || name.includes('inventory')
                        ? `${ratioName} afecta los calendarios de depreciación de activos y valoración de inventario para propósitos fiscales. ${isGood ? 'La utilización eficiente de activos maximiza los beneficios de depreciación.' : 'La rotación lenta puede requerir castigos de inventario afectando el ingreso gravable.'} Considere deducciones de la Sección 179 o depreciación acelerada para mejoras de equipo.`
                        : name.includes('debt')
                            ? `Los gastos de intereses de deuda son deducibles de impuestos. ${ratioName} (${val}) indica ${isGood ? 'uso balanceado del escudo fiscal de deuda' : 'potencial para optimizar la estructura de capital para eficiencia fiscal'}. Consulte con asesor tributario sobre oportunidades de reestructuración de deuda.`
                            : `${ratioName} (${val}) tiene implicaciones fiscales indirectas a través de su efecto en la rentabilidad general y el flujo de caja disponible para pagos estimados de impuestos.`
            }
        };

        // Manufacturing/Operations Perspective
        const manufacturingPerspective = {
            en: {
                title: '🏭 Manufacturing / Operations Perspective',
                analysis: name.includes('inventory') || name.includes('turnover')
                    ? `${ratioName} (${val}) measures operational efficiency. ${isGood ? 'Strong turnover indicates optimal inventory levels and efficient supply chain.' : isWarning ? 'Consider adjusting reorder points or safety stock levels.' : 'Slow turnover ties up capital and increases carrying costs.'} Industry benchmark (${indVal}) suggests ${isAbove ? 'you are a leader in inventory management' : 'room for improvement in demand forecasting and procurement'}.`
                    : name.includes('asset') || name.includes('sales to')
                        ? `${ratioName} (${val}) reflects equipment and facility utilization. ${isGood ? 'Assets are generating strong revenue - maintain equipment properly to sustain performance.' : 'Consider capacity optimization or asset disposition strategies.'} Production scheduling and preventive maintenance directly impact this metric.`
                        : name.includes('receivable') || name.includes('collection')
                            ? `${ratioName} (${val}) affects working capital for operations. ${isGood ? 'Efficient collections support steady parts procurement and payroll.' : 'Slow collections may require delaying equipment purchases or parts orders.'} Consider invoice factoring for forklift financing customers.`
                            : name.includes('productivity') || name.includes('personnel')
                                ? `${ratioName} (${val}) directly measures workforce efficiency. ${isGood ? 'Strong productivity supports competitive service rates.' : 'Consider technician training, tool upgrades, or workflow optimization.'} Industry comparison (${indVal}) helps set labor cost targets.`
                                : `${ratioName} (${val}) impacts operational decision-making. ${isGood ? 'Current performance supports operational investments.' : 'May need to prioritize cost reduction initiatives before expansion.'}`
            },
            es: {
                title: '🏭 Perspectiva de Manufactura / Operaciones',
                analysis: name.includes('inventory') || name.includes('turnover')
                    ? `${ratioName} (${val}) mide la eficiencia operacional. ${isGood ? 'Una rotación fuerte indica niveles óptimos de inventario y cadena de suministro eficiente.' : isWarning ? 'Considere ajustar puntos de reorden o niveles de stock de seguridad.' : 'La rotación lenta amarra capital y aumenta costos de almacenamiento.'} El benchmark de la industria (${indVal}) sugiere ${isAbove ? 'que es líder en gestión de inventario' : 'espacio para mejorar en pronóstico de demanda y compras'}.`
                    : name.includes('asset') || name.includes('sales to')
                        ? `${ratioName} (${val}) refleja la utilización de equipos e instalaciones. ${isGood ? 'Los activos están generando ingresos fuertes - mantenga el equipo adecuadamente para sostener el rendimiento.' : 'Considere optimización de capacidad o estrategias de disposición de activos.'} La programación de producción y el mantenimiento preventivo impactan directamente esta métrica.`
                        : name.includes('receivable') || name.includes('collection')
                            ? `${ratioName} (${val}) afecta el capital de trabajo para operaciones. ${isGood ? 'Cobros eficientes apoyan la adquisición constante de partes y nómina.' : 'Los cobros lentos pueden requerir retrasar compras de equipo u órdenes de partes.'} Considere factoraje de facturas para clientes de financiamiento de montacargas.`
                            : name.includes('productivity') || name.includes('personnel')
                                ? `${ratioName} (${val}) mide directamente la eficiencia de la fuerza laboral. ${isGood ? 'La productividad fuerte apoya tarifas de servicio competitivas.' : 'Considere capacitación de técnicos, mejoras de herramientas u optimización de flujo de trabajo.'} La comparación con la industria (${indVal}) ayuda a establecer metas de costos laborales.`
                                : `${ratioName} (${val}) impacta la toma de decisiones operacionales. ${isGood ? 'El rendimiento actual apoya inversiones operacionales.' : 'Puede necesitar priorizar iniciativas de reducción de costos antes de la expansión.'}`
            }
        };

        // Investor/Owner Perspective
        const investorPerspective = {
            en: {
                title: '💰 Investor / Owner Perspective',
                analysis: name.includes('return') || name.includes('roe') || name.includes('roa')
                    ? `${ratioName} (${val}) is critical for owner value creation. ${isGood ? 'Strong returns justify reinvestment and support owner distributions.' : isWarning ? 'Returns may not compensate for business risk adequately.' : 'Returns below cost of capital destroy shareholder value.'} vs Industry (${indVal}): ${isAbove ? 'Outperformance could support higher business valuation.' : 'Underperformance may reduce business sale multiples.'}`
                    : name.includes('profit') || name.includes('margin')
                        ? `${ratioName} (${val}) drives owner cash flow. ${isGood ? 'Healthy margins support dividend distributions and reinvestment.' : 'Margin compression limits owner returns.'} Industry comparison (${indVal}) affects competitive positioning and market valuation. Consider pricing strategies to improve margins.`
                        : name.includes('debt') || name.includes('equity')
                            ? `${ratioName} (${val}) affects owner risk exposure. ${isGood ? 'Balanced leverage optimizes return on owner investment.' : 'High leverage increases owner risk but may amplify returns.'} Owners should monitor debt covenants and refinancing opportunities.`
                            : name.includes('current') || name.includes('quick')
                                ? `${ratioName} (${val}) protects owner investment from liquidity crises. ${isGood ? 'Strong liquidity provides cushion for market disruptions.' : 'Low liquidity may require owner capital contributions during downturns.'} Essential for business continuity and owner wealth preservation.`
                                : `${ratioName} (${val}) contributes to overall business value. ${isGood ? 'Strong performance supports higher business multiples.' : 'Improvement needed to maximize exit value.'} Industry benchmark (${indVal}) provides target for operational excellence.`
            },
            es: {
                title: '💰 Perspectiva del Inversionista / Propietario',
                analysis: name.includes('return') || name.includes('roe') || name.includes('roa')
                    ? `${ratioName} (${val}) es crítico para la creación de valor del propietario. ${isGood ? 'Retornos fuertes justifican la reinversión y apoyan distribuciones al propietario.' : isWarning ? 'Los retornos pueden no compensar adecuadamente el riesgo del negocio.' : 'Retornos por debajo del costo de capital destruyen valor para los accionistas.'} vs Industria (${indVal}): ${isAbove ? 'El rendimiento superior podría apoyar una valoración de negocio más alta.' : 'El bajo rendimiento puede reducir los múltiplos de venta del negocio.'}`
                    : name.includes('profit') || name.includes('margin')
                        ? `${ratioName} (${val}) impulsa el flujo de caja del propietario. ${isGood ? 'Márgenes saludables apoyan distribuciones de dividendos y reinversión.' : 'La compresión de márgenes limita los retornos del propietario.'} La comparación con la industria (${indVal}) afecta el posicionamiento competitivo y la valoración de mercado. Considere estrategias de precios para mejorar márgenes.`
                        : name.includes('debt') || name.includes('equity')
                            ? `${ratioName} (${val}) afecta la exposición al riesgo del propietario. ${isGood ? 'El apalancamiento balanceado optimiza el retorno sobre la inversión del propietario.' : 'El alto apalancamiento aumenta el riesgo del propietario pero puede amplificar los retornos.'} Los propietarios deben monitorear los convenios de deuda y oportunidades de refinanciamiento.`
                            : name.includes('current') || name.includes('quick')
                                ? `${ratioName} (${val}) protege la inversión del propietario de crisis de liquidez. ${isGood ? 'Liquidez fuerte proporciona colchón para disrupciones del mercado.' : 'Baja liquidez puede requerir aportaciones de capital del propietario durante recesiones.'} Esencial para la continuidad del negocio y preservación del patrimonio del propietario.`
                                : `${ratioName} (${val}) contribuye al valor general del negocio. ${isGood ? 'El rendimiento fuerte apoya múltiplos de negocio más altos.' : 'Se necesita mejora para maximizar el valor de salida.'} El benchmark de la industria (${indVal}) proporciona un objetivo para la excelencia operacional.`
            }
        };

        // Insurance Company Perspective - for coverage decisions, premium calculations, and risk assessment
        const insurancePerspective = {
            en: {
                title: '🛡️ Insurance Company Perspective',
                analysis: name.includes('current') || name.includes('quick') || name.includes('liquidity')
                    ? `${ratioName} (${val}) indicates the insured's ability to pay premiums and maintain coverage. ${isGood ? 'Strong liquidity suggests reliable premium payments and lower risk of policy lapse.' : isWarning ? 'Moderate liquidity may require premium payment monitoring.' : 'Low liquidity increases risk of coverage gaps - consider premium financing offers.'} For a forklift service company, consistent coverage is critical for liability protection during equipment repairs and operations.`
                    : name.includes('asset') || name.includes('inventory') || name.includes('turnover')
                        ? `${ratioName} (${val}) affects asset valuation for property insurance. ${isGood ? 'Efficient asset utilization suggests proper maintenance and lower loss exposure.' : 'Slow turnover may indicate idle equipment at higher risk of damage or theft.'} Insurance underwriters evaluate equipment age, condition, and utilization when setting premiums. Example: A $500K forklift fleet with ${val} turnover may qualify for ${isAbove ? 'preferred rates due to active use' : 'higher premiums due to potential obsolescence claims'}.`
                        : name.includes('debt') || name.includes('equity') || name.includes('leverage')
                            ? `${ratioName} (${val}) signals financial stability for insurance underwriting. ${isGood ? 'Lower leverage indicates stable operations and reduced business interruption risk.' : 'High leverage may suggest financial stress, increasing claim likelihood during downturns.'} Surety bond capacity and general liability coverage terms are directly impacted. At ${val} D/E, ${isAbove ? 'premium credits may apply' : 'additional collateral or higher premiums may be required'}.`
                            : name.includes('profit') || name.includes('margin')
                                ? `${ratioName} (${val}) reflects business viability for long-term coverage. ${isGood ? 'Healthy profits support safety investments and risk mitigation programs.' : 'Margin pressure may lead to deferred maintenance, increasing accident risk.'} Loss control programs are easier to implement with strong margins. Example: A company with ${val}% margins can afford OSHA training and equipment upgrades that reduce workers' comp claims.`
                                : `${ratioName} (${val}) is evaluated when assessing overall insurability. ${isGood ? 'Strong financial metrics support favorable coverage terms and multi-policy discounts.' : 'Weak metrics may result in higher deductibles or coverage exclusions.'} For material handling operations, comprehensive coverage requires demonstrating financial responsibility. Industry comparison (${indVal}) helps benchmark risk profile.`
            },
            es: {
                title: '🛡️ Perspectiva de la Compañía de Seguros',
                analysis: name.includes('current') || name.includes('quick') || name.includes('liquidity')
                    ? `${ratioName} (${val}) indica la capacidad del asegurado para pagar primas y mantener cobertura. ${isGood ? 'Liquidez fuerte sugiere pagos de primas confiables y menor riesgo de caducidad de póliza.' : isWarning ? 'Liquidez moderada puede requerir monitoreo de pagos de primas.' : 'Baja liquidez aumenta el riesgo de brechas de cobertura - considere ofertas de financiamiento de primas.'} Para una empresa de servicio de montacargas, la cobertura consistente es crítica para protección de responsabilidad durante reparaciones y operaciones.`
                    : name.includes('asset') || name.includes('inventory') || name.includes('turnover')
                        ? `${ratioName} (${val}) afecta la valoración de activos para seguros de propiedad. ${isGood ? 'La utilización eficiente de activos sugiere mantenimiento adecuado y menor exposición a pérdidas.' : 'La rotación lenta puede indicar equipo inactivo con mayor riesgo de daño o robo.'} Los suscriptores de seguros evalúan la edad, condición y utilización del equipo al establecer primas. Ejemplo: Una flota de montacargas de $500K con rotación de ${val} puede calificar para ${isAbove ? 'tarifas preferenciales debido al uso activo' : 'primas más altas debido a posibles reclamaciones por obsolescencia'}.`
                        : name.includes('debt') || name.includes('equity') || name.includes('leverage')
                            ? `${ratioName} (${val}) señala estabilidad financiera para suscripción de seguros. ${isGood ? 'Menor apalancamiento indica operaciones estables y menor riesgo de interrupción de negocio.' : 'Alto apalancamiento puede sugerir estrés financiero, aumentando la probabilidad de reclamaciones durante recesiones.'} La capacidad de fianzas y los términos de cobertura de responsabilidad general se ven directamente afectados. Con D/E de ${val}, ${isAbove ? 'pueden aplicar créditos de prima' : 'se puede requerir colateral adicional o primas más altas'}.`
                            : name.includes('profit') || name.includes('margin')
                                ? `${ratioName} (${val}) refleja la viabilidad del negocio para cobertura a largo plazo. ${isGood ? 'Ganancias saludables apoyan inversiones en seguridad y programas de mitigación de riesgos.' : 'La presión en márgenes puede llevar a mantenimiento diferido, aumentando el riesgo de accidentes.'} Los programas de control de pérdidas son más fáciles de implementar con márgenes fuertes. Ejemplo: Una empresa con márgenes de ${val}% puede pagar capacitación OSHA y mejoras de equipo que reducen reclamaciones de compensación laboral.`
                                : `${ratioName} (${val}) se evalúa al determinar la asegurabilidad general. ${isGood ? 'Métricas financieras sólidas apoyan términos de cobertura favorables y descuentos multi-póliza.' : 'Métricas débiles pueden resultar en deducibles más altos o exclusiones de cobertura.'} Para operaciones de manejo de materiales, la cobertura integral requiere demostrar responsabilidad financiera. La comparación con la industria (${indVal}) ayuda a establecer el perfil de riesgo.`
            }
        };

        return {
            bank: language === 'es' ? bankPerspective.es : bankPerspective.en,
            fiscal: language === 'es' ? fiscalPerspective.es : fiscalPerspective.en,
            manufacturing: language === 'es' ? manufacturingPerspective.es : manufacturingPerspective.en,
            investor: language === 'es' ? investorPerspective.es : investorPerspective.en,
            insurance: language === 'es' ? insurancePerspective.es : insurancePerspective.en
        };
    };

    return {
        formula: matchedDef.formula,
        explanation: language === 'es' ? matchedDef.explanation.es : matchedDef.explanation.en,
        recommendations: language === 'es' ? generateRecommendations().es : generateRecommendations().en,
        industryAnalysis: language === 'es' ? industryAnalysis.es : industryAnalysis.en,
        stakeholders: generateStakeholderPerspectives()
    };
};

// Helper: Determine if lower is better for a given ratio name
const isLowerBetter = (ratioName: string): boolean => {
    const lowerBetterPatterns = [
        'collection period',
        'days payable',
        'days receivable',
        'inventory turnover (days)',
        'inventory days',
        'debt to equity',
        'debt ratio',
        'debt-to',
        'personnel productivity', // cost ratio - lower is better
        'variable cost',
        'break-even',
        'accounts payable (days)', // longer payment is actually better (but we handle this separately)
    ];
    const name = ratioName.toLowerCase();
    return lowerBetterPatterns.some(pattern => name.includes(pattern));
};

// Helper: Format values based on ratio type
const formatRatioValue = (value: number, ratioName: string): string => {
    const name = ratioName.toLowerCase();

    // Dollar amounts (EBITDA, Break-even, Working Capital, etc.)
    if (name.includes('ebitda') || name.includes('break-even as %') ||
        name.includes('working capital') && !name.includes('%') && !name.includes('ratio')) {
        if (Math.abs(value) >= 1000) {
            return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return `$${value.toFixed(2)}`;
    }

    // Percentages (margin, ROE, ROA, etc.)
    if (name.includes('%') || name.includes('margin') || name.includes('return on') ||
        name.includes('growth') || name.includes('contribution')) {
        return `${(value * 100).toFixed(2)}%`;
    }

    // Days (collection, payable, inventory days)
    if (name.includes('days') || name.includes('period')) {
        return `${value.toFixed(1)} days`;
    }

    // Turnover ratios
    if (name.includes('turnover (x)')) {
        return `${value.toFixed(2)}x`;
    }

    // Default: 2-4 decimal places
    return value.toFixed(value < 10 ? 4 : 2);
};

// Industry comparison bar component with smart color logic
const IndustryComparisonBar: React.FC<{ current: number; industry: number | undefined; label: string | undefined; ratioName?: string }> = ({ current, industry, label, ratioName = '' }) => {
    if (!industry) return <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>—</span>;

    const percentage = Math.min((current / industry) * 100, 150);

    // Determine if performance is good based on whether lower or higher is better
    const lowerIsBetter = isLowerBetter(ratioName);
    const isGood = lowerIsBetter
        ? current <= industry  // For metrics where lower is better
        : current >= industry; // For metrics where higher is better

    const barColor = isGood ? '#10b981' : '#ef4444';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', minWidth: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}>
                <span style={{ color: barColor, fontWeight: 600 }}>{(current).toFixed(2)}</span>
                <span style={{ color: 'var(--text-secondary)' }}>vs</span>
                <span style={{ color: 'var(--text-secondary)' }}>{industry.toFixed(2)}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', position: 'relative' }}>
                {/* Industry target marker */}
                <div style={{
                    position: 'absolute',
                    left: '66.7%',
                    top: '-2px',
                    height: '8px',
                    width: '2px',
                    background: 'var(--text-secondary)',
                    borderRadius: '1px'
                }} />
                {/* Current value bar */}
                <div style={{
                    width: `${Math.min(percentage * 0.667, 100)}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                }} />
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                {label || 'Industry Average'}
            </div>
        </div>
    );
};

export const FinancialRatiosSection: React.FC<FinancialRatiosSectionProps> = ({ fsRatios }) => {
    const [selectedRatio, setSelectedRatio] = useState<Ratio | null>(null);
    const { t, language } = useLanguage();

    // Generate dynamic analysis for selected ratio
    const ratioAnalysis = selectedRatio ? generateRatioAnalysis(selectedRatio, language) : null;

    return (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.1) 100%)', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--accent-primary)' }}>📈 {t('ratios.title')}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                        {fsRatios.company} | {t('ratios.asOf')} {fsRatios.asOf}
                    </p>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    {t('ratios.source')}: {fsRatios.source}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {/* Solvency Ratios */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.5rem', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        💧 {t('ratios.solvency')}
                    </h4>
                    <table style={{ width: '100%', fontSize: '0.8rem' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)' }}>
                                <th style={{ textAlign: 'left', padding: '0.25rem' }}>{t('ratios.ratio')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.current')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.prior')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.benchmark')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fsRatios.solvencyRatios?.map((r, i) => (
                                <tr
                                    key={i}
                                    style={{ borderTop: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onClick={() => setSelectedRatio(r)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0.5rem 0.25rem', color: 'var(--text-primary)' }}>
                                        {r.name} <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>🔍</span>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                        {r.unit === '%' ? `${(r.current * 100).toFixed(1)}%` : r.current.toFixed(4)}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', color: 'var(--text-secondary)' }}>
                                        {typeof r.prior === 'number' ? (r.unit === '%' ? `${(r.prior * 100).toFixed(1)}%` : r.prior.toFixed(4)) : r.prior}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem' }}>
                                        <IndustryComparisonBar current={r.current} industry={r.industryBenchmark} label={r.industryLabel} ratioName={r.name} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Safety Ratios */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.5rem', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🛡️ {t('ratios.safety')}
                    </h4>
                    <table style={{ width: '100%', fontSize: '0.8rem' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)' }}>
                                <th style={{ textAlign: 'left', padding: '0.25rem' }}>{t('ratios.ratio')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.current')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.prior')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.benchmark')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fsRatios.safetyRatios?.map((r, i) => (
                                <tr
                                    key={i}
                                    style={{ borderTop: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onClick={() => setSelectedRatio(r)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0.5rem 0.25rem', color: 'var(--text-primary)' }}>
                                        {r.name} <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>🔍</span>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                        {r.unit === '%' ? `${(r.current * 100).toFixed(1)}%` : r.current.toFixed(4)}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', color: 'var(--text-secondary)' }}>
                                        {typeof r.prior === 'number' ? (r.unit === '%' ? `${(r.prior * 100).toFixed(1)}%` : r.prior.toFixed(4)) : r.prior}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem' }}>
                                        <IndustryComparisonBar current={r.current} industry={r.industryBenchmark} label={r.industryLabel} ratioName={r.name} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Profitability Ratios */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.5rem', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📊 {t('ratios.profitability')}
                    </h4>
                    <table style={{ width: '100%', fontSize: '0.8rem' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)' }}>
                                <th style={{ textAlign: 'left', padding: '0.25rem' }}>{t('ratios.ratio')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.current')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.prior')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.benchmark')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fsRatios.profitabilityRatios?.map((r, i) => (
                                <tr
                                    key={i}
                                    style={{ borderTop: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onClick={() => setSelectedRatio(r)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0.5rem 0.25rem', color: 'var(--text-primary)' }}>
                                        {r.name} <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>🔍</span>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                        {r.unit === '$' ? `$${r.current.toLocaleString()}` : r.unit === '%' ? `${(r.current * 100).toFixed(1)}%` : r.current.toFixed(4)}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', color: 'var(--text-secondary)' }}>
                                        {typeof r.prior === 'number' ? (r.unit === '$' ? `$${r.prior.toLocaleString()}` : r.unit === '%' ? `${(r.prior * 100).toFixed(1)}%` : r.prior.toFixed(4)) : r.prior}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem' }}>
                                        <IndustryComparisonBar current={r.current} industry={r.industryBenchmark} label={r.industryLabel} ratioName={r.name} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Asset Management Ratios */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.5rem', padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🔄 {t('ratios.assetManagement')}
                    </h4>
                    <table style={{ width: '100%', fontSize: '0.8rem' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)' }}>
                                <th style={{ textAlign: 'left', padding: '0.25rem' }}>{t('ratios.ratio')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.current')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.prior')}</th>
                                <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.benchmark')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fsRatios.assetManagementRatios?.map((r, i) => (
                                <tr
                                    key={i}
                                    style={{ borderTop: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onClick={() => setSelectedRatio(r)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0.5rem 0.25rem', color: 'var(--text-primary)' }}>
                                        {r.name} <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>🔍</span>
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                        {r.unit === 'days' ? `${r.current.toFixed(1)} days` : r.current.toFixed(4)}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', color: 'var(--text-secondary)' }}>
                                        {typeof r.prior === 'number' ? (r.unit === 'days' ? `${r.prior.toFixed(1)} days` : r.prior.toFixed(4)) : r.prior}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem' }}>
                                        <IndustryComparisonBar current={r.current} industry={r.industryBenchmark} label={r.industryLabel} ratioName={r.name} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Leading Financial Indicators */}
                {fsRatios.leadingIndicators && fsRatios.leadingIndicators.length > 0 && (
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.5rem', padding: '1rem' }}>
                        <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            📈 {t('ratios.leadingIndicators') || 'Leading Financial Indicators'}
                        </h4>
                        <table style={{ width: '100%', fontSize: '0.8rem' }}>
                            <thead>
                                <tr style={{ color: 'var(--text-secondary)' }}>
                                    <th style={{ textAlign: 'left', padding: '0.25rem' }}>{t('ratios.indicator')}</th>
                                    <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.current')}</th>
                                    <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.prior')}</th>
                                    <th style={{ textAlign: 'right', padding: '0.25rem' }}>{t('ratios.benchmark')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fsRatios.leadingIndicators.map((r, i) => (
                                    <tr
                                        key={i}
                                        style={{ borderTop: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onClick={() => setSelectedRatio(r)}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '0.5rem 0.25rem', color: 'var(--text-primary)' }}>
                                            {r.name} <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>🔍</span>
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                                            {formatRatioValue(r.current, r.name)}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem', color: 'var(--text-secondary)' }}>
                                            {typeof r.prior === 'number' ? formatRatioValue(r.prior, r.name) : r.prior}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '0.5rem 0.25rem' }}>
                                            <IndustryComparisonBar current={r.current} industry={r.industryBenchmark} label={r.industryLabel} ratioName={r.name} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {/* Ratio Detail Modal */}
            {selectedRatio && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={() => setSelectedRatio(null)}
                >
                    <div
                        style={{
                            background: 'var(--bg-card)',
                            borderRadius: '1rem',
                            maxWidth: '900px',
                            width: '100%',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: '1.5rem',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid var(--border-color)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                            <div>
                                <h2 style={{ margin: 0, color: 'var(--accent-primary)', fontSize: '1.5rem' }}>
                                    {selectedRatio.name}
                                </h2>
                                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <strong>{t('ratios.formula')}:</strong> {ratioAnalysis?.formula || 'N/A'}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedRatio(null)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Current Value Box */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                background: selectedRatio.status === 'excellent' ? 'rgba(16, 185, 129, 0.15)' :
                                    selectedRatio.status === 'good' ? 'rgba(16, 185, 129, 0.1)' :
                                        selectedRatio.status === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('ratios.currentValue')}</div>
                                <div style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 700,
                                    color: selectedRatio.status === 'excellent' ? '#10b981' : selectedRatio.status === 'good' ? '#34d399' : selectedRatio.status === 'warning' ? '#f59e0b' : '#ef4444'
                                }}>
                                    {selectedRatio.unit === '%' ? `${(selectedRatio.current * 100).toFixed(1)}%` :
                                        selectedRatio.unit === '$' ? `$${selectedRatio.current.toLocaleString()}` :
                                            selectedRatio.unit === 'days' ? `${selectedRatio.current.toFixed(1)} days` : `${selectedRatio.current.toFixed(2)}x`}
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('ratios.priorYear')}</div>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {typeof selectedRatio.prior === 'number' ?
                                        (selectedRatio.unit === '%' ? `${(selectedRatio.prior * 100).toFixed(1)}%` :
                                            selectedRatio.unit === '$' ? `$${selectedRatio.prior.toLocaleString()}` :
                                                selectedRatio.unit === 'days' ? `${selectedRatio.prior.toFixed(1)} days` : `${selectedRatio.prior.toFixed(2)}x`) : 'N/A'}
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{t('ratios.industryBenchmark')}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                                    {selectedRatio.industryBenchmark ? selectedRatio.industryBenchmark.toFixed(2) : 'N/A'}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                    {selectedRatio.industryLabel || ''}
                                </div>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>📋 {t('ratios.whatMeans')}</h4>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                {ratioAnalysis?.explanation || 'No explanation available.'}
                            </p>
                        </div>

                        {/* Industry Comparison Analysis */}
                        {ratioAnalysis?.industryAnalysis && (
                            <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontSize: '0.95rem' }}>📊 {language === 'es' ? 'Análisis vs Industria' : 'Industry Comparison'}</h4>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                    {ratioAnalysis.industryAnalysis}
                                </p>
                            </div>
                        )}

                        {/* Recommendations */}
                        {ratioAnalysis?.recommendations && ratioAnalysis.recommendations.length > 0 && (
                            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', color: '#10b981', fontSize: '0.95rem' }}>💡 {t('ratios.recommendations')}</h4>
                                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.8' }}>
                                    {ratioAnalysis.recommendations.map((rec: string, i: number) => (<li key={i}>{rec}</li>))}
                                </ul>
                            </div>
                        )}

                        {/* Stakeholder Perspectives - Interactive Analysis */}
                        {ratioAnalysis?.stakeholders && (
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                    👥 {language === 'es' ? 'Perspectivas de los Interesados' : 'Stakeholder Perspectives'}
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {/* Bank Perspective */}
                                    <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6', fontSize: '0.85rem' }}>{ratioAnalysis.stakeholders.bank.title}</h5>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                                            {ratioAnalysis.stakeholders.bank.analysis}
                                        </p>
                                    </div>
                                    {/* Fiscal Perspective */}
                                    <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#8b5cf6', fontSize: '0.85rem' }}>{ratioAnalysis.stakeholders.fiscal.title}</h5>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                                            {ratioAnalysis.stakeholders.fiscal.analysis}
                                        </p>
                                    </div>
                                    {/* Manufacturing Perspective */}
                                    <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#f59e0b', fontSize: '0.85rem' }}>{ratioAnalysis.stakeholders.manufacturing.title}</h5>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                                            {ratioAnalysis.stakeholders.manufacturing.analysis}
                                        </p>
                                    </div>
                                    {/* Investor Perspective */}
                                    <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#10b981', fontSize: '0.85rem' }}>{ratioAnalysis.stakeholders.investor.title}</h5>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                                            {ratioAnalysis.stakeholders.investor.analysis}
                                        </p>
                                    </div>
                                    {/* Insurance Company Perspective - spans full width */}
                                    <div style={{ gridColumn: '1 / -1', background: 'rgba(236, 72, 153, 0.08)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                                        <h5 style={{ margin: '0 0 0.5rem 0', color: '#ec4899', fontSize: '0.85rem' }}>{ratioAnalysis.stakeholders.insurance.title}</h5>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.5' }}>
                                            {ratioAnalysis.stakeholders.insurance.analysis}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedRatio(null)} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>{t('ratios.close')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
