import * as currency from '@shopify/theme-currency';
import * as cart from '@shopify/theme-cart';

/*
 * QuickAdd Class
 * 
 * A custom class that extends HTMLElement.
 * Handles the feedback for the form and updates
 * prices and inputs.
 */
class QuickAdd extends HTMLElement{

    constructor() {
        super();

        this.variantType = 'select';

        this.formSelector = '[data-product-form]';
        this.purchaseOptionSelector = '[data-purchase-option-selector]';
        this.singlePlanSelector = '[data-single-plan-selector]';
        this.optionSelectors = this.querySelectorAll('[data-option-selector]');

        this.form = this.querySelector(this.formSelector);

        const productHandle = this.form.dataset.productHandle;

        // Fetch the product data from the .js endpoint because it includes
        // more data than the .json endpoint. Alternatively, you could inline the output
        // of {{ product | json }} inside a <script> tag, with the downside that the
        // data can never be cached by the browser.
        fetch(`/products/${productHandle}.js`)
        .then(response => {
            return response.json();
        })
        .then(productJSON => {

            this.form.dataset.product = JSON.stringify(productJSON);
            
            this.optionSelectors.forEach((input) => {
                input.addEventListener('change', this.onFormChange.bind(this));
            });

            this.form.addEventListener('submit', this.onFormSubmit.bind(this));
        });
    };

    /*
     * On form change callback
     */
    onFormChange() {

        console.log('form changed');

        const variant = this.getSelectedVariant();

        this.updatePricing();
        this.updateId();
        this.updateMainCTA();
        this.updateStockNotice();

        this.form.dispatchEvent(Events().formUpdated._event(this.form));
    };

    updateId(){

        const variant = this.getSelectedVariant();
        const idSelector = this.form.querySelector('[name="id"]');

        if( idSelector === undefined ) return false;
        idSelector.value = parseInt( variant.id );
    }

    /*
     * On form submit callback
     *
     * Uses the Cart Object from Shopify Scripts
     */
    onFormSubmit(event) {

        event.preventDefault();

        this.submitForm();
    };

    submitForm(){

        // Submit item to cart from form
        cart.addItemFromForm(this.form).then(item => {
            document.dispatchEvent(Events().itemAdded._event(item));

            cart.getState().then(state => {

                document.dispatchEvent(Events().cartUpdated._event(state));
                document.querySelector('cart-items').getSectionInnerHTML();
            });
        })
        .finally( () => {
            this.classList.add('is--hidden');

            const miniCart = document.querySelector('[data-mini-cart]');
            const blackout = miniCart.querySelector('[data-blackout]');

            document.querySelector('body').classList.add('overflow-hidden');
            
            miniCart.classList.add(this.openClass);
            blackout.classList.add(this.openClass);
            miniCart.classList.remove(this.closeClass);
            blackout.classList.remove(this.closeClass);
        })
        .catch(e => {
            console.error(e);
        });
    }

    /*
     * Finds the selected variant
     */
    getSelectedVariant() {

        const productJSON = JSON.parse(this.form.dataset.product);
        let options;

        if( this.variantType == "radio" ){

            const fieldsets = Array.from(this.querySelectorAll('fieldset'));
            options = fieldsets.map((fieldset) => {
                return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
            });

        }else{

            options = Array.from(this.form.querySelectorAll('[data-option-selector]'), (select) => select.value);
        }

        console.log('options: ', options);
        console.log('productJSON: ', productJSON);
        
        return productJSON.variants.find((variant) => {
            return !variant.options.map((option, index) => {
                return options[index] === option;
            }).includes(false);
        });
    };

    /*
     * Get the selected Selling Plan if one is available
     */
    getSelectedSellingPlan() {

        const variant = this.getSelectedVariant();
        
        const availableSellingPlanAllocations = variant.selling_plan_allocations || false;
        const selectedPlan = this.form.querySelector(this.singlePlanSelector);
        let selectedSellingPlan;

        if( availableSellingPlanAllocations === false ) return false;

        availableSellingPlanAllocations.forEach((sellingPlan)=>{

            if( sellingPlan.selling_plan_id == selectedPlan.value ){
                selectedSellingPlan = sellingPlan;
            }
        });

        return (typeof selectedSellingPlan === undefined) ? false : selectedSellingPlan;
    };

    /*
     * Check if the user has selected subscription
     * or one time purchase
     */
    getPurchaseOption () {

        const purchaseOptions = this.form.querySelectorAll(this.purchaseOptionSelector);
        let purchaseOption;

        // If there are no purchase option selectors return
        if( purchaseOptions === undefined ) return false;

        purchaseOptions.forEach((option)=>{
            if( option.checked ){
                purchaseOption = option.value;
            }
        });

        return purchaseOption;
    };

    /*
     * Update the form Pricing
     * Pass through the form object
     */
    updatePricing (){

        const sellingPlan = this.getSelectedSellingPlan();
        const purchaseOption = this.getPurchaseOption();
        const variant = this.getSelectedVariant();

        const priceElement = this.form.querySelector('[data-product-price]');
        const comparePriceElement = this.form.querySelector('[data-product-compare-price]');
        const sellingPlanElement = this.form.querySelector(this.singlePlanSelector);

        let price, comparePrice;

        if( purchaseOption != "subscription" ){

            price           = variant.price;
            comparePrice    = variant.compare_at_price;

            if( sellingPlanElement !== undefined && sellingPlanElement !== null ){
                sellingPlanElement.disabled = true;
            }

        }else{

            if( sellingPlan ){
                price           = sellingPlan.price;
                comparePrice    = sellingPlan.compare_at_price;

                if( sellingPlanElement !== undefined && sellingPlanElement !== null ){
                    sellingPlanElement.disabled = false;
                }
            }
        }
        
        // Return if there is no price element in the form
        if( priceElement === undefined ) return false;

        priceElement.innerHTML = currency.formatMoney(price, window.theme.moneyFormat);

        if( comparePrice > price ){
            comparePriceElement.classList.remove("hidden");
            comparePriceElement.innerHTML = currency.formatMoney(comparePrice, window.theme.moneyFormat);
        }else{
            comparePriceElement.classList.add("hidden");
        }
    };
    
    /*
     * Update the stock notice
     * Show if the item is in stock or not.
     * Can't show the amount in stock as that information is
     * not availble on a per variant basis.
     */
    updateStockNotice () {

        const variant = this.getSelectedVariant();
        const stockNotice = this.querySelector('[data-product-stock-notice]');

        // Return if there is no stock notice in the form
        if( stockNotice === undefined || stockNotice === null ) return false;

        if( variant.available ){
            stockNotice.innerHTML = `<p class="font-bold text-green-500">${ window.theme.strings.inStock }</p>`;
        }else{
            stockNotice.innerHTML = `<p class="font-bold text-red-500">${ window.theme.strings.soldOut }</p>`;
        }
    };

    /*
     * Update the main CTA
     * Disable the CTA if not available.
     */
    updateMainCTA () {

        const variant = this.getSelectedVariant();
        const cta = this.form.querySelector('[name="add"]');

        // Return if there is no main CTA
        if( cta === undefined || cta === null ) return false;

        if( variant.available ){
            cta.disabled = false;
        }else{
            cta.disabled = true;
        }
    }
}

customElements.define('quick-add', QuickAdd);

class QuickAddTrigger extends HTMLElement{

    constructor() {
        super();

        this.target = this.dataset.target;

        this.addEventListener('click', this.toggleQuickAdd.bind(this));
    }

    toggleQuickAdd() {
        document.getElementById(this.target).classList.toggle('is--hidden');
    }
}

customElements.define('quick-add-trigger', QuickAddTrigger);