'use strict';

/**
 * @author Copyright RIKSOF (Private) Limited.
 *
 * @file Module for working with SES email service.
 */
const NodeMailer = require( 'nodemailer' );
const SmtpTransport = require( 'nodemailer-smtp-transport' );
const BAD_GATEWAY = 502;
const BAD_REQUEST = 400;

/**
 * SES helper class for working with AWS SES to send email.
 *
 * @class [Email Object]
 *
 */
class Email {

  /**
   * Constructor creating transporter object using the default SMTP or SES
   *
   * @constructor
   *
   * @param {Object} credentials                        Credentials for SES.
   *
   * @class [Email Object]
   */
  constructor( credentials ) {
    this.transporter = NodeMailer.createTransport( SmtpTransport({
      service: credentials.service,
      host: credentials.host,
      port: parseInt( credentials.port, 10),
      auth: {
        user: credentials.user,
        pass: credentials.pass
      }
    }));
  }

  /**
   * Sends an email to the given identifier.
   *
   * @param {Object} data                               Data to be send.
   *
   * @returns {Promise} p
   */
  send( data ) {
    let me = this;
    return new Promise( function OnPromise( resolve, reject ) {

      // Initialize error as empty.
      let error = null;

      // Initialize mailOptions as empty.
      let mailOptions = {};

      // Validate the param from constains value
      if ( !data.from ) error = new Error( 'Please provide sender address for an email' );

      // Validate the param to constains value
      if ( !data.to ) error = new Error( 'Please provide recipient address for an email' );

      // Validate the param subject constains value
      if ( !data.subject ) error = new Error( 'Please provide subject for an email' );

      // Validate the param message constains value
      if ( !data.message ) error = new Error( 'Please provide message for an email' );

      // Throw Validation error if exist.
      if ( error ) {
        error.status = BAD_REQUEST;
        reject( error );
      }

      // sender address
      mailOptions.from = data.from;

      // list of recipients
      mailOptions.to = data.to;

      // Subject content
      mailOptions.subject = data.subject;

      // Check text is html or plaintext
      if ( data.isHtml ) mailOptions.html = data.message;
      else mailOptions.text = data.message;

      // Checks the param cc constains value
      if ( data.cc ) mailOptions.cc = data.cc;

      // Checks the param bcc constains value
      if ( data.bcc ) mailOptions.bcc = data.bcc;

      // Checks the param replyTo constains value
      if ( data.replyTo ) mailOptions.replyTo = data.replyTo;

      // Checks the param attachments constains array Objects
      if ( data.attachments && data.attachments.length ) mailOptions.attachments = data.attachments;

      me.transporter.sendMail( mailOptions, function SendMail( error, info ) {

        if ( error ) {
          // Is the error object if message failed
          error.status = BAD_GATEWAY;
          reject( error );
        } else {
          // otherwise is the info that includes the result, the exact format depends on the transport mechanism used.
          resolve( info );
        }
      });
    });
  }
}

// Make the module available to all
module.exports = Email;
