/*!
 * v 0.3
 * mustache_mallmaverick.js - 
 * MobileFringe copywrite 2014
 */
 
 
 
 
 
 
 
function renderStoresListTemplate(header_template_id,item_template_id,html_id,not_empty_section_id,empty_section_id,stores){
    var item_list = [];
    
    var first_letter = "";
    var header_template_html = $(header_template_id).html();
    Mustache.parse(header_template_html);
    var item_template_html = $(item_template_id).html();
    Mustache.parse(item_template_html);
    $.each( stores , function( key, val ) {
        localizeObject(val);
        if(val['name'].charAt(0) != first_letter){
            var header_value = val['name'].charAt(0).toUpperCase();
            var header_rendered = Mustache.render(header_template_html,{"header_id":header_value,"header":header_value});
            item_list.push(header_rendered);
            first_letter = val['name'].charAt(0);
            //val.header = first_letter;
        }
        first_letter = val['name'].charAt(0);
        val.header = first_letter.toUpperCase();
        // applyPromoJobsStyle(val);
    
        var item_rendered = Mustache.render(item_template_html,val);
        item_list.push(item_rendered);
    });
    if(stores.length > 0){
        $(not_empty_section_id).show();
        $(empty_section_id).hide();
        $(html_id).html(item_list.join(''));
    }else{
        $(not_empty_section_id).hide();
        $(empty_section_id).show();
    }
}

function renderStoresByCategoriesListTemplate(header_template_id,item_template_id,html_id,not_empty_section_id,empty_section_id,stores){
    var item_list = [];
    var header_template_html = $(header_template_id).html();
    Mustache.parse(header_template_html);
    var item_template_html = $(item_template_id).html();
    Mustache.parse(item_template_html);
    
    
    var all_categories = getStoreCategories();
    for (i = 0; i < all_categories.length; i++) {
        var add_header = true;
        
        for (j = 0; j < stores.length; j++) {
            if($.inArray(parseInt(all_categories[i].id), stores[j].categories) > -1){
                if(add_header){
                    localizeObject(all_categories[i]);
                    localizeObject(stores[j]);
                    var header_rendered = Mustache.render(header_template_html,{"header_id":"cat_"+all_categories[i].id,"header":all_categories[i].name});
                    item_list.push(header_rendered);
                    add_header = false;
                }
                stores[j].header = "cat_"+all_categories[i].id;
                applyPromoJobsStyle(stores[j]);
                var item_rendered = Mustache.render(item_template_html,stores[j]);
                item_list.push(item_rendered);
            }
        }
    }
    
    
    if(stores.length > 0){
        $(not_empty_section_id).show();
        $(empty_section_id).hide();
        $(html_id).html(item_list.join(''));
    }else{
        $(not_empty_section_id).hide();
        $(empty_section_id).show();
    }
} 

function getCloudinaryImageUrl(existing_url) {
    if(!existing_url ||  existing_url.indexOf('missing.png') > -1 || existing_url.length === 0){
        //http://css-tricks.com/snippets/html/base64-encode-of-1x1px-transparent-gif/
        return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    }
    return "https://mallmaverick.cdn.speedyrails.net" + existing_url;
}

function getCloudinaryImageURL(existing_url) {
    return getCloudinaryImageUrl(existing_url);
}


function renderPromotionsListTemplate(template_id,template_id_no_image,html_id,not_empty_section_id,empty_section_id,promotions){
    var item_list = [];
    var template_html = $(template_id).html();
    Mustache.parse(template_html);
    var template_html_no_image = $(template_id_no_image).html();
    Mustache.parse(template_html_no_image);
    $.each( promotions , function( key, val ) {
        today = moment();
        webDate = moment(val.show_on_web_date)
        if (today >= webDate) {
            if(Cookies.get('current_locale') == "en-CA"){
                val.promo_name = val.name;
                
                if(val.description.length > 300){
                    val.desc_short = val.description.substring(0,300) + "...";
                }
                else{
                    val.desc_short = val.description;
                }
            }
            if(Cookies.get('current_locale') == "fr-CA"){
                val.promo_name = val.name_2;
                
                 if(val.description_2.length > 300){
                    val.desc_short = val.description_2.substring(0,300) + "...";
                }
                else{
                    val.desc_short = val.description_2;
                }
            }
            
            var start = moment(val.start_date).tz(getPropertyTimeZone());
            var end = moment(val.end_date).tz(getPropertyTimeZone());
            if (start.format("DMY") == end.format("DMY")){
                val.start_date = start.format("YYYY-MM-D");
            } else {
                val.start_date = start.format("YYYY-MM-D");
                val.end_date = end.format("YYYY-MM-D");
            }
    
            localizeObject(val);
            
            var promotionable_name = "";
            var promotionable_url = "";
            if(val['promotionable_type'] == 'Store' && showOnWeb(val)){
                var store_details = getStoreDetailsByID(val['promotionable_id']);
                if (store_details){
                    localizeObject(store_details);
                    val.store = store_details;
                    val.promotionable_name = store_details.name;
                    val.promotionable_url = "../stores/" + store_details.slug;
                }
            }

            if(hasImage(val.promo_image_url)){
                val.promo_image_url = getCloudinaryImageUrl(val.promo_image_url);
                val.promo_image_url_abs = getAbsoluteImageURL(val.promo_image_url_abs);
                var rendered = Mustache.render(template_html,val);
                item_list.push(rendered);
            }else{
                var rendered_no_image = Mustache.render(template_html_no_image,val);
                item_list.push(rendered_no_image);
            }
         } 
    });
    if(promotions.length > 0){
        $(not_empty_section_id).show();
        $(empty_section_id).hide();
        $(html_id).html(item_list.join(''));
    }else{
        $(not_empty_section_id).hide();
        $(empty_section_id).show();
    }
}

function renderStoresWithPromotionsTemplate(template_id,html_id){
    var html_item_list = [];
    var template_html = $(template_id).html();
    Mustache.parse(template_html);
    $.each( getStoresList() , function( key, val ) {
        if(val['promotions'].length > 0){
            localizeObject(val);
            var rendered = Mustache.render(template_html,val);
            html_item_list.push(rendered);
        }
    });
    
    $(html_id).html(html_item_list.join(''));
}


function renderCategoriesWithPromotionsTemplate(template_id,html_id){
    var item_list = {};
    $.each( getStoresList() , function( key, val ) {
        localizeObject(val);
        if(val['promotions'].length > 0){
            for (i = 0; i < val['categories'].length; i++) { 
                if(item_list[val['categories'][i]]){
                    item_list[val['categories'][i]] = item_list[val['categories'][i]] + 1;
                }else{
                    item_list[val['categories'][i]] = 1;
                }
            }
        }
        
        
    });
    var html_item_list = [];
    var template_html = $(template_id).html();
    Mustache.parse(template_html);
    $.each( item_list , function( key, val ) {
        localizeObject(getCategoryDetails(key));
        var rendered = Mustache.render(template_html, 
            {category_id: key,
            category_name: getCategoryDetails(key).name,
            promotion_count: val
        });
        html_item_list.push(rendered);
    });
    $(html_id).html(html_item_list.join(''));
}


function renderCategoriesListTemplate(template_id,html_id,categories){
    var item_list = [];
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    $.each( categories , function( key, val ) {
        localizeObject(val);
        var rendered = Mustache.render(template_html,val);
        item_list.push(rendered);
    });
    $(html_id).html(item_list.join(''));
}

function renderJobsListTemplate(template_id,html_id,not_empty_section_id,empty_section_id,jobs){
    var item_list = [];
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    $.each( jobs , function( key, val ) {
        if(Cookies.get('current_locale') == "en-CA"){
            val.job_name = val.name;
            val.jobtype = val.job_type;
            val.rich_desc = val.rich_description
        }
        if(Cookies.get('current_locale') == "fr-CA"){
            val.job_name = val.name_2
            if(val.job_type == "Part Time") {
                val.jobtype = "Temps partiel"
            }
            if(val.job_type == "Part Time/Full Time") {
                val.jobtype = "Temps partiel/Temps Plein"
            }
            if(val.job_type == "Full Time") {
                val.jobtype = "Temps Plein"
            }
            val.rich_desc = val.rich_description_2
        }
        localizeObject(val);
        if(val['jobable_type'] == 'Store'){
            var store_details = getStoreDetailsByID(val.jobable_id);
            val.store_name = store_details.name;
            val.store_slug = store_details.slug;
            val.has_store_info_css = "inline;";
        }else{
            val.store_name = getPropertyDetails().name;
            val.has_store_info_css = "none;";
        }
        
        if(val.contact_email.length + val.contact_name.length + val.contact_website.length + val.contact_phone.length > 0){
            val.has_contact_info_css = "inline;"
        }else{
            val.has_contact_info_css = "none;"
        }
        
        var rendered = Mustache.render(template_html,val);
        item_list.push(rendered);
    });
    if(jobs.length > 0){
        $(not_empty_section_id).show();
        $(empty_section_id).hide();
        $(html_id).html(item_list.join(''));
    }else{
        $(not_empty_section_id).hide();
        $(empty_section_id).show();
    }
}

function renderEventsListTemplate(template_id,template_id_no_image,html_id,not_empty_section_id,empty_section_id,events){
    var item_list = [];
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    var template_html_no_image = $(template_id_no_image).html();
    Mustache.parse(template_html_no_image);
    $.each( events , function( key, val ) {
        if(Cookies.get('current_locale') == "en-CA"){
            val.event_name = val.name;
            
            if(val.description.length > 300){
                val.desc_short = val.description.substring(0,300) + "...";
            }
            else{
                val.desc_short = val.description;
            }
            val.event_img = getImageURL(val.event_image_url)
        }
        if(Cookies.get('current_locale') == "fr-CA"){
            val.event_name = val.name_2;
            
             if(val.description_2.length > 300){
                val.desc_short = val.description_2.substring(0,300) + "...";
            }
            else{
                val.desc_short = val.description_2;
            }
            
            val.event_img = getImageURL(val.event_image2_url)
        }
        var start = moment(val.start_date).tz(getPropertyTimeZone());
        var end = moment(val.end_date).tz(getPropertyTimeZone());
        if (start.format("DMY") == end.format("DMY")){
            val.startDate = start.format("YYYY-MM-D");
        } else {
            val.startDate = start.format("YYYY-MM-D");
            val.endDate = end.format("YYYY-MM-D");
        }   
        
        // localizeObject(val);
        if(hasImage(val.event_image_url)){
            val.event_image_url = getImageURL(val.event_image_url);
            val.event_image_url_abs = getAbsoluteImageURL(val.event_image_url_abs);
            var rendered = Mustache.render(template_html,val);
            item_list.push(rendered);
        }else{
            var rendered_no_image = Mustache.render(template_html_no_image,val);
            item_list.push(rendered_no_image);
        }
    });
    if(events.length > 0){
        $(not_empty_section_id).show();
        $(empty_section_id).hide();
        $(html_id).html(item_list.join(''));
    }else{
        $(not_empty_section_id).hide();
        $(empty_section_id).show();
    }
}

function renderStoreDetailsTemplate(template_id,html_id,store_details){
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    
    if(Cookies.get('current_locale') == "en-CA"){
        store_details.store_desc = store_details.rich_description;  
    }
    if(Cookies.get('current_locale') == "fr-CA"){
        store_details.store_desc = store_details.rich_description_2;  
    }
    
    // localizeObject(store_details);
    store_details.store_front_image_url = getImageURL(store_details.store_front_image_url);
    store_details.store_front_image_url_abs = getAbsoluteImageURL(store_details.store_front_image_url_abs);
    var rendered = Mustache.to_html(template_html,store_details);
    $(html_id).html(rendered);
}

function renderPromotionDetailsTemplate(template_id,html_id,promotion_details){
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    if(Cookies.get('current_locale') == "en-CA"){
        promotion_details.promo_name = promotion_details.name;  
    }
    if(Cookies.get('current_locale') == "fr-CA"){
        promotion_details.promo_name = promotion_details.name_2;  
    }
    
    var start = moment(promotion_details.start_date).tz(getPropertyTimeZone());
    var end = moment(promotion_details.end_date).tz(getPropertyTimeZone());
    if (start.format("DMY") == end.format("DMY")){
        promotion_details.start_date = start.format("YYYY-MM-D");
    } else {
        promotion_details.start_date = start.format("YYYY-MM-D");
        promotion_details.end_date = end.format("YYYY-MM-D");
    }
            
    // localizeObject(promotion_details);
    promotion_details.promo_image_url = getCloudinaryImageUrl(promotion_details.promo_image_url);
    promotion_details.promo_image_url_abs = getAbsoluteImageURL(promotion_details.promo_image_url_abs);
    if(promotion_details.promotionable_type == 'Store'){
        var store_details = getStoreDetailsByID(promotion_details.promotionable_id);
        promotion_details.store_details = store_details;
    } 
    var rendered = Mustache.to_html(template_html,promotion_details);
    $(html_id).html(rendered);
}

function renderEventDetailsTemplate(template_id,html_id,event_details){
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
   
    if(Cookies.get('current_locale') == "en-CA"){
        event_details.event_name = event_details.name;
        
        event_details.rich_desc = event_details.rich_description;
    }
    if(Cookies.get('current_locale') == "fr-CA"){
        event_details.event_name = event_details.name_2;
        
        event_details.rich_desc = event_details.rich_description_2;
    }
    
    var start = moment(event_details.start_date).tz(getPropertyTimeZone());
    var end = moment(event_details.end_date).tz(getPropertyTimeZone());
    if (start.format("DMY") == end.format("DMY")){
        event_details.start_date = start.format("YYYY-MM-D");
    } else {
        event_details.start_date = start.format("YYYY-MM-D");
        event_details.end_date = end.format("YYYY-MM-D");
    }
        
    localizeObject(event_details);
    
    event_details.event_image_url = getImageURL(event_details.event_image_url);
    event_details.event_image_url_abs = getAbsoluteImageURL(event_details.event_image_url_abs);
    if(event_details.eventable_type == 'Store'){
        var store_details = getStoreDetailsByID(event_details.eventable_id);
        promotion_details.store_details = store_details;
    }

    var rendered = Mustache.to_html(template_html,event_details);
    $(html_id).html(rendered);
}

function renderRegularDayHours(template_id,html_id,day_of_week){
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    var day_hours = getRegHoursForDayIndex(day_of_week);
    
    var open_time = moment(day_hours.open_time).tz(getPropertyTimeZone()); 
    var close_time = moment(day_hours.close_time).tz(getPropertyTimeZone()); 
    if(Cookies.get('current_locale') == "fr-CA"){
        day_hours.open_time = open_time.format("H") + "h";
        day_hours.close_time = close_time.format("H") + "h";
    }
    if(Cookies.get('current_locale') == "en-CA"){
        day_hours.open_time = open_time.format("h:mm A");
        day_hours.close_time = close_time.format("h:mm A");
    }

    if(day_hours.is_closed){
        day_hours.is_open_css = "display:none";
        day_hours.is_closed_css = "display:inline";
    }else{
        day_hours.is_open_css = "display:inline";
        day_hours.is_closed_css = "display:none";
    }
    setLocaleDateFormats(day_hours);
    var rendered = Mustache.to_html(template_html,day_hours);
    $(html_id).html(rendered);
}

function renderTodaysHours(template_id,html_id){
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    var day_hours = getTodaysHours();
    
    var open_time = moment(day_hours.open_time).tz(getPropertyTimeZone()); 
    var close_time = moment(day_hours.close_time).tz(getPropertyTimeZone()); 
    if(Cookies.get('current_locale') == "fr-CA"){
        day_hours.open_time = open_time.format("H") + "h";
        day_hours.close_time = close_time.format("H") + "h";
    }
    if(Cookies.get('current_locale') == "en-CA"){
        day_hours.open_time = open_time.format("h:mm A");
        day_hours.close_time = close_time.format("h:mm A");
    }
    
    localizeObject(day_hours);
    if(day_hours.is_closed){
        day_hours.is_open_css = "display:none";
        day_hours.is_closed_css = "display:inline";
    }else{
        day_hours.is_open_css = "display:inline";
        day_hours.is_closed_css = "display:none";
    }
    var now = new Date();
    var day = now.getDayName();
    day_hours.day_name = day;
    setLocaleDateFormats(day_hours);
    var rendered = Mustache.to_html(template_html,day_hours);
    $(html_id).html(rendered);
}

function renderHolidayHours(template_id,html_id,not_empty_section_id,empty_section_id,hours,num_to_show){
    var item_list = [];
    var template_html = $(template_id).html();
    Mustache.parse(template_html);
    var count = 0;
    $.each( hours , function( key, val ) {
        
        if(val.is_holiday && count < num_to_show){
            val.holiday_date = moment(val.holiday_date).format("YYYY-MM-D");
            
            var open_time = moment(val.open_time).tz(getPropertyTimeZone()); 
            var close_time = moment(val.close_time).tz(getPropertyTimeZone()); 
            if(Cookies.get('current_locale') == "fr-CA"){
                localizeObject(val);
                val.open_time = open_time.format("H") + "h" + open_time.format("mm");
                val.close_time = close_time.format("H") + "h" + close_time.format("mm");
            }
            if(Cookies.get('current_locale') == "en-CA"){
                // val.name = val.holiady_name;
                val.open_time = open_time.format("h:mm A");
                val.close_time = close_time.format("h:mm A");
            }
            
            if(val.is_closed){
                val.is_open_css = "display:none";
                val.is_closed_css = "display:inline";
            } else {
                val.is_open_css = "display:inline";
                val.is_closed_css = "display:none";
            }
            
            // setLocaleDateFormats(val);
            var rendered = Mustache.render(template_html,val);
            item_list.push(rendered);
            count++;
        }
    });
    if(count > 0){
        $(not_empty_section_id).show();
        $(empty_section_id).hide();
        $(html_id).html(item_list.join(''));
    } else {
        $(not_empty_section_id).hide();
        $(empty_section_id).show();
    }
}

function renderClosedHoliday(template_id,html_id,not_empty_section_id,empty_section_id,hours,num_to_show){
    var item_list = [];
    var template_html = $(template_id).html();
    Mustache.parse(template_html);
    var count = 0;
    $.each( hours , function( key, val ) {
        if(val.is_holiday && val.is_closed &&count < num_to_show){
            val.is_open_css = "display:none";
            val.is_closed_css = "display:inline";
          
            setLocaleDateFormats(val);
            var rendered = Mustache.render(template_html,val);
            item_list.push(rendered);
            count++;
        }
    });
    if(count > 0){
        $(not_empty_section_id).show();
        $(empty_section_id).hide();
        $(html_id).html(item_list.join(''));
    } else {
        $(not_empty_section_id).hide();
        $(empty_section_id).show();
    }
}

function renderOpenHoliday(template_id,html_id,not_empty_section_id,empty_section_id,hours,num_to_show){
    var item_list = [];
    var template_html = $(template_id).html();
    Mustache.parse(template_html);
    var count = 0;
    $.each( hours , function( key, val ) {
        if(val.is_holiday && !val.is_closed &&count < num_to_show){
            val.is_open_css = "display:inline";
            val.is_closed_css = "display:none";
          
            setLocaleDateFormats(val);
            var rendered = Mustache.render(template_html,val);
            item_list.push(rendered);
            count++;
        }
    });
    if(count > 0){
        $(not_empty_section_id).show();
        $(empty_section_id).hide();
        $(html_id).html(item_list.join(''));
    }else{
        $(not_empty_section_id).hide();
        $(empty_section_id).show();
    }
}

function renderSearchResultsTemplate(template_id,html_id,search_results){
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    var rendered = Mustache.to_html(template_html,search_results);
    $(html_id).html(rendered);
}

function renderAddressDirectionsTemplate(template_id,html_id,property_details){
    var template_html = $(template_id).html();
    Mustache.parse(template_html);   // optional, speeds up future uses
    var rendered = Mustache.to_html(template_html,property_details);
    $(html_id).html(rendered);
}

function renderPopup(popup_template, popup_form, popup){
    var item_list = [];
    var popup_template_html = $(popup_template).html();
    Mustache.parse(popup_template_html);   // optional, speeds up future uses

    $.each( popup , function( key, val ) {
        val.photo_url = getImageURLStaging(val.photo_url);
        var repo_rendered = Mustache.render(popup_template_html,val);
        item_list.push(repo_rendered);
    });
    
    $(popup_form).html(item_list.join(''));
}