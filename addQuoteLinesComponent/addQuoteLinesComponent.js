import { LightningElement, wire,api,track } from 'lwc';
import selectQuotePage from "./selectQuotePage.html";
import selectProductPage from "./selectProductPage.html";
import getProductMethod from '@salesforce/apex/getAllProducts.getProductMethod';
import addLineitems from '@salesforce/apex/getAllProducts.addLineitems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";

const columns = [
    { label: 'Product Name', fieldName: 'Name', type: 'name' },
    { label: 'Product Code', fieldName: 'ProductCode', type: 'text' },
    { label: 'Product Family', fieldName: 'Family', type: 'Picklist' },
];
export default class AddQuoteLinesComponent  extends NavigationMixin(LightningElement) {
    data = [];
    columns = columns;
    @track selectedProductIds = [];
    isDisabled = true
    showSelectProductPage = true;
    @track selectedQuoteId;

    render() {
        return this.showSelectProductPage ? selectProductPage : selectQuotePage;
      }

    @wire(getProductMethod)
    listOfProducts({error, data}) {
        if (data) {
            this.data = data;
        } else if (error) {
            this.data = undefined;
            console.error('Error fetching products:', error);
        }
    }

    handleRowSelection(event) {
        const selectedRows = event.detail.selectedRows;
        console.log('Selected rows:', JSON.parse(JSON.stringify(selectedRows)));
        
        this.selectedProductIds = selectedRows.map(row => row.Id);
        console.log('Selected Product IDs:', JSON.parse(JSON.stringify(this.selectedProductIds)));
        
        // Update isDisabled based on whether any rows are selected
        this.isDisabled = this.selectedProductIds.length === 0;
    }

    handleRecordSelection(event) {
        console.log('Selected Record : ' +event.detail.recordId);
        try {
            this.selectedQuoteId = event.detail.recordId;
        } catch (error) {
            console.error('@ERROROROR '+error);
        }
         
    }

    get formattedSelectedProductIds() {
        return this.selectedProductIds.join(', ');
    }
    switchTemplate(){
        this.showSelectProductPage = !this.showSelectProductPage;
    }

    addIntoQuote() {
        console.log('Adding line items for products:', this.selectedProductIds);
        console.log('Selected Quote ID:'+ this.selectedQuoteId);

        addLineitems({productList:this.selectedProductIds,qID:this.selectedQuoteId})
        .then(result => {
            console.log(result);
            const evt = new ShowToastEvent({
                title: 'Line Items Added',
                message: 'Line Items Successfully Added to Quote',
                variant: 'success'
            });
            this.dispatchEvent(evt);
            setTimeout(() => {
                console.log('waiting 3 second');
                this.navigateToQuoteRecord();
            }, 3000);
        })
        .catch(error => {
            console.error('error');
            const evt = new ShowToastEvent({
                title: 'Cought Error',
                message: error,
                variant: 'error'
            });
            this.dispatchEvent(evt);
        });

    }
    navigateToQuoteRecord() {
        console.log('after 3 sec'+this.selectedQuoteId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.selectedQuoteId,
                objectApiName: 'SBQQ__Quote__c', 
                actionName: 'view'
            }
        }).then(() => {
            console.log('Navigation successful');
        }).catch(error => {
            console.error('Navigation error:', error);
        });
    }
}