public class getAllProducts {

    @AuraEnabled(cacheable=true)
    public static List<Product2> getProductMethod(){
        try {
            List<Product2> products = [SELECT Id, Name, ProductCode, Family FROM Product2];
            System.debug('List of Products: '+products);
            return products;
        } catch (Exception e) {
            System.debug('Error'+e);
            return null;
        }
        
    }

    @AuraEnabled
    public static void addLineitems(List<Id> productList ,Id qID){
        System.debug('ProductId: '+productList);
        System.debug('qID: '+qID);
        
        List<SBQQ__QuoteLine__c> qLineList = new List<SBQQ__QuoteLine__c>();
        for(Id p : productList){
            SBQQ__QuoteLine__c ql = new SBQQ__QuoteLine__c();
            ql.SBQQ__Quote__c = qID;
            ql.SBQQ__Product__c =p;
            qLineList.add(ql);
        }
        if(!qLineList.isEmpty()){
            try {
                Insert qLineList;
            } catch (Exception e) {
                System.debug('Got this error when trying to add products: '+e.getMessage());
                throw new AuraHandledException('Could not add products to quote. Try to add products manually to the quote.');
            }
        }
    }
    
}