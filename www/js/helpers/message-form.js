/**
 * Helpers for constructing the message form and parsing its data.
 */

var findWhere = require('lodash.findwhere');
var filter = require('lodash.filter');
var forEach = require('lodash.foreach');
var isArray = require('lodash.isarray');
var isEmpty = require('lodash.isempty');
var isUndefined = require('lodash.isundefined');
var keys = require('lodash.keys');
var startsWith = require('lodash.startswith');

var models = require('../../../models');


/**
 * Parse out the topic options for a given legislator.
 * @param topicElem
 * @param legislator
 */
var parseTopicOptions = function(topicElem, legislator) {
  var options = isArray(topicElem.optionsHash) ?
    topicElem.optionsHash : keys(topicElem.optionsHash);

  //loop below to set 'Housing' as selected topic, set default index to 1 so 'Abortion' not selected if condition not true
  var selOpt = 1;
  options.forEach(function(element, index) {
    if(element.indexOf('Hou') !== -1 || element.indexOf('HOU') !== -1 || element.indexOf('hou') !== -1) {
      selOpt = index;
    }
  });

  if (selOpt === 1) {
      options.forEach(function(element, index) {
        if(element.indexOf('Oth') !== -1 || element.indexOf('OTH') !== -1 || element.indexOf('oth') !== -1) {
          selOpt = index;
        }
      });
  }

  return {
    bioguideId: legislator.bioguideId,
    name: legislator.title + '. ' + legislator.lastName,
    options: options,
    optionsHash: topicElem.optionsHash,
    selected: options[selOpt]
  };
};


/**
 * Parse out the county options from a county FormElement.
 * @param countyElem
 * @param addressCounty
 * @returns {Object}
 */
var parseCountyOptions = function(countyElem, addressCounty) {
  var countyOptions = countyElem.optionsHash;
  // Guess the correct county based on the address.county value
  var selectedCounty = filter(countyOptions, function(countyOption) {
    return addressCounty === countyOption || startsWith(countyOption, addressCounty);
  })[0];

  return {
    selected: isUndefined(selectedCounty) ? countyOptions[0] : selectedCounty,
    options: countyOptions
  };
};


/**
 *
 * @returns {{}}
 */
var makeSenderInfo = function(formData, parensPhone) {

  return {
    namePrefix: formData.prefix,
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: parensPhone.replace('(', '').replace(')', '').replace(' ', '-'),
    parenPhone: parensPhone,
    county: formData.county
  };

};


/**
 *
 * @param legislator
 * @param formData
 * @param afhourl
 * @param topic An object describing the topics for a legislator, as created by parseTopicOptions.
 * @returns {{}}
 */
var makeMessageInfo = function(legislator, formData, afhourl, topic) {

  var topicValue = null;
  if (!isUndefined(topic)) {
    topicValue = isArray(topic.optionsHash) ?
      topic.selected : topic.optionsHash[topic.selected];
  }

  if (afhourl.indexOf('fy19-hud-budget-cuts') > -1) {

    return {
      topic: topicValue,
      subject: 'Please Fully Fund Housing Programs',
      //message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \n' + formData.message
      message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \nThe FY19 White House budget proposal came out on February 12, 2018 and proposes to decimate affordable housing funding. Historically productive programs like Section 8 Housing Choice Vouchers, Public Housing and CDBG/HOME are being drastically reduced or eliminated. To see how these cuts affect states, counties, and smaller locales, including ours, please see this page at Affordable Housing Online:\n\n' + afhourl + '\n\n Please support affordable housing for our area by ignoring the White House budget proposal and fully funding (or even increasing) existing budgets for the HUD programs listed above.' + formData.message
    };

  } else if (afhourl == 'https://affordablehousingonline.com/advocacy/issues/rent-relief-act') {

    return {
      topic: topicValue,
      subject: 'Support Renter Tax Credits',
      //message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \n' + formData.message
      message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \nPlease support bills proposing a tax credit to help struggling renters. Too many low-income renters are cost-burdened, with many having extreme cost burden and paying more than half their incomes for rent. \n\n I encourage your support for either the Rent Relief Act sponsored by Senator Kamala Harris in the Senate and Representative Scott Peters in the House, or the HOME Act sponsored by Senator Cory Booker in the Senate. These bills provide the kind of refundable tax credit that will help low-income renters keep their homes and move their families towards opportunity. \n\n Far too many low-income renters find crippling housing costs are keeping them from the American dream. Renter tax credits will help millions of families find and keep affordable homes. \n\n For more info and analysis, see this report on Affordable Housing Online: https://affordablehousingonline.com/blog/renter-tax-credits-proposed-address-u-s-rental-housing-crisis/ \n\n' + formData.message
    };

  } else if (afhourl == 'https://affordablehousingonline.com/advocacy/issues/HUD-rent-increases-2018') {

    return {
      topic: topicValue,
      subject: 'Please oppose HUD rent increases',
      //message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \n' + formData.message
      message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \nThe Trump Administration proposes to increase rents and add work requirements for households receiving federal housing assistance. Millions of low-income renters will see their rents rise and face the prospect of eviction if Congress accepts these proposals. \n\n For more info and analysis, see this page on Affordable Housing Online: https://affordablehousingonline.com/blog/carsons-proposed-rent-increases-will-devastate-millions/ \n\n' + formData.message
    };

  } else if (afhourl == 'https://affordablehousingonline.com/advocacy/issues/fy19-hud-budget') {

    return {
      topic: topicValue,
      subject: 'Ignore Trump Budget and Fully Fund Housing Programs',
      //message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \n' + formData.message
      message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \nThe FY19 Trump Budget came out on February 12, 2018 and proposes to decimate affordable housing funding. Historically productive programs like Section 8 Housing Choice Vouchers, Public Housing and CDBG/HOME are being drastically reduced or eliminated.\n\n Please, please, please. Ignore the Trump Budget and do the right thing by fully funding the HUD budget. \n\n For more info and analysis, see this page on Affordable Housing Online: https://affordablehousingonline.com/fy19-hud-budget-cuts?utm_source=email&utm_medium=advocacy_dio&utm_campaign=embedlink \n\n' + formData.message
    };

  }  else if (afhourl == 'https://affordablehousingonline.com/advocacy/issues/trump-punishes-immigrants-receiving-housing-benefits') {

    return {
      topic: topicValue,
      subject: 'Oppose Changes to Public Charge Rules for Legal Immigrants',
      //message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \n' + formData.message
      message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \nThe Trump Administration’s effort to change the rules for determining an immigrant’s status as a public charge will hurt immigrant families, their employers and the communities where they live. Housing assistance, food assistance, healthcare for children and tax refunds for working people help stabilize families and keep them working towards a dream of citizenship.\n\n Congress has authorized the use of these support programs by legal immigrants because they improve their chances of self-sufficiency, children’s well-being is protected and public health and safety are improved.\n\n Please oppose the proposed changes to the public charge rule. Let the Department of Homeland Security and the White House know that the changes to the public charge rule will be very harmful to our communities and economy.\n\n For more info and analysis, see this page on Affordable Housing Online: https://affordablehousingonline.com/blog/trump-proposal-punishes-legal-immigrants-receiving-housing-benefits/ \n\n' + formData.message
    };

  } else {
    return {
      topic: topicValue,
      subject: 'Affordable Housing Data',
      //message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \n' + formData.message
      message: 'Dear ' + legislator.title + ' ' + legislator.lastName + ', \nThis web page has interesting data regarding affordable housing for our area:\n ' + afhourl +'. \n' + formData.message
    };
  }

};


/**
 *
 * @returns {{}}
 */
var makeCampaignInfo = function() {

  return {
    uuid: '',
    orgURL: '',
    orgName: ''
  };

};


/**
 *
 * @param legislator
 * @param formData
 * @param phoneValue
 * @param topicOptions
 * @param address
 * @param afhourl
 * @returns {*}
 */
var makeMessage = function(legislator, formData, phoneValue, topicOptions, address, afhourl) {
  var messageInfo = makeMessageInfo(legislator, formData, afhourl, topicOptions[legislator.bioguideId]);

  var msg = new models.Message({
    bioguideId: legislator.bioguideId,
    subject: messageInfo.subject,
    message: messageInfo.message,
    sender: makeSenderInfo(formData, phoneValue),
    canonicalAddress: address,
    campaign: makeCampaignInfo()
  });

  // Topic can be null, and swagger doesn't support an is nullable property afaict
  if (messageInfo.topic !== null) {
    msg.topic = messageInfo.topic;
  }

  return msg;
};


/**
 * Gets data to populate a county field from the LegislatorFormElements objects.
 *
 * NOTE: The current contact congress data shows no cases where > 1 rep for a given location supports
 *       county data in their contact form. So, find the first example of county data and use that.
 *       This will need to be updated where > 1 reps adopt county data.
 *
 * @param legislatorsFormElements
 * @param addressCounty
 */
var getCountyData = function(legislatorsFormElements, addressCounty) {
  var countyKey = '$ADDRESS_COUNTY';
  var countyElem;

  for (var i = 0, countyElemArr; i < legislatorsFormElements.length; ++i) {
    countyElemArr = /** @type {Array} */ filter(legislatorsFormElements[i].formElements, function(formElem) {
      return formElem.value === countyKey;
    });
    if (countyElemArr.length > 0) {
      countyElem = countyElemArr[0];
    }
  }

  var countyData = {};
  if (!isUndefined(countyElem)) {
    countyData = parseCountyOptions(countyElem, addressCounty);
  }

  return countyData;
};


/**
 *
 * @param legislatorsFormElements
 * @param legislators
 * @returns {{}}
 */
var getTopicOptions = function(legislatorsFormElements, legislators) {
  var topicKey = '$TOPIC';
  var topicOptions = {};

  var topicElem;
  forEach(legislatorsFormElements, function(legislatorFormElems) {
    topicElem = filter(legislatorFormElems.formElements, function(formElem) {
      return formElem.value === topicKey;
    })[0];

    if (!isUndefined(topicElem)) {
      topicElem = parseTopicOptions(
        topicElem,
        findWhere(legislators, {bioguideId: legislatorFormElems.bioguideId})
      );
      topicOptions[legislatorFormElems.bioguideId] = topicElem;
    }
  });

  return topicOptions;
};


/**
 * Create supplementary form fields from the LegislatorFormElements models.
 */
var createFormFields = function(legislatorsFormElements, legislators, address) {
  var countyData = getCountyData(legislatorsFormElements, address.county);

  return {
    countyData: countyData,
    formData: {
      prefix: 'Ms.',
      county: countyData.selected
    },
    topicOptions: getTopicOptions(legislatorsFormElements, legislators)
  };
};


module.exports.createFormFields = createFormFields;

module.exports.getCountyData = getCountyData;
module.exports.parseCountyOptions = parseCountyOptions;

module.exports.getTopicOptions = getTopicOptions;
module.exports.parseTopicOptions = parseTopicOptions;

module.exports.makeMessage = makeMessage;
module.exports.makeSenderInfo = makeSenderInfo;
module.exports.makeMessageInfo = makeMessageInfo;
module.exports.makeCampaignInfo = makeCampaignInfo;
