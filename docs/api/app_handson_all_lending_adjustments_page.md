# API Reference: page

Source file: `app/handson/all/lending/adjustments/page.tsx`

## Whitelisted API Endpoints

### `function outstanding(loan.loan_amount || 0) - (loan.total_principal_paid || 0); return ( <div className="max-w-xl mx-auto py-12"> <Link href={`/handson/all/lending/loan/${loan.name}`} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors" > <ChevronLeft className="w-4 h-4 mr-1" /> {t('common.back')} </Link> <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"> <div className="p-6 border-b border-gray-100 flex items-center space-x-4"> <div className="p-3 bg-blue-50 rounded-lg"> <Scale className="w-6 h-6 text-blue-600" /> </div> <div> <h1 className="text-xl font-bold text-gray-900"> {t('app.lending.balance_adjustment')} </h1> <p className="text-gray-500 text-sm"> {t('app.lending.adjustment_desc', { loan: loan.name })} </p> </div> </div> <div className="p-6"> <form onSubmit={handleSubmit} className="space-y-6"> {} <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl"> <button type="button" onClick={()`
*No documentation provided (generation failed).*
