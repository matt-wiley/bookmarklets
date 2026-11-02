(() => {

    const segmentClass = '.ytwTranscriptSegmentViewModelHost'

    const logger = (() => {
        const prefix = '[-x-x-]'
        return {
            info: (message) => { console.log(`${prefix} ${message}`) },
            warn: (message) => { console.warn(`${prefix} ${message}`) },
            error: (message) => { console.error(`${prefix} ${message}`) },
            debug: (message) => { console.debug(`${prefix} ${message}`) },
            obj: (jsonObject) => { console.dir(prefix, jsonObject) }
        }
    })()

    const youtubeHostnameMatch = window.location.hostname.match('www.youtube.com')
    if(! (youtubeHostnameMatch && youtubeHostnameMatch.length == 1 ) ) {
        logger.error('invalid hostname -- aborting')
        return   
    }

    const transcriptArray = Array.from(document.querySelectorAll(segmentClass))
    logger.debug(`transcript array length: ${transcriptArray.length}`)

    if( transcriptArray.length < 1 ) {
        logger.error('transcript UI not found -- did you open the transcript in the page?')
        return
    }

    const lineValidationCheck = (innerTextFromArrayItem) => {
        
        const _line = innerTextFromArrayItem

        const buildResult = (args) => {
            return {
                isValid: args.isValid,
                line: args.line
            }
        }

        logger.debug(_line)
        const lineSegments = _line.split('\n')
        
        const hasThreeSegments = lineSegments.length == 3
        if(! hasThreeSegments) {
            logger.warn(`'${_line}' --> failed on: hasThreeSegments`)
            return buildResult({
                isValid: false,
                line: _line
            })
        }

        const timeCodeMatch = lineSegments[0].match('[0-9]?[0-9]:[0-9][0-9]')
        const segmentOneIsTimecode = timeCodeMatch && timeCodeMatch.length == 1 // One and only one timecode
        if (! segmentOneIsTimecode) {
            logger.warn(`'${_line}' --> failed on: segmentOneIsTimecode`)
            return buildResult({
                isValid: false,
                line: _line
            })
        }

        const segmentThreeIsNotEmpty = (lineSegments[2] ?? '').trim().length > 0 // Match is not null, so string is not empty
        if(! segmentThreeIsNotEmpty) {
            invalidLines.push(i)
            logger.warn(`'${_line}' --> failed on: segmentThreeIsNotEmpty`)
            return buildResult({
                isValid: false,
                line: _line
            })
        }

        if (! (hasThreeSegments && segmentOneIsTimecode && segmentThreeIsNotEmpty )) {
            logger.error(`'${_line}' --> failed on: final recheck`)
            return buildResult({
                isValid: false,
                line: _line
            })
        }

        return buildResult({
            isValid: true,
            line: _line
        })
    }

    const pullTranscription = (transcriptArrayFromSelectorQuery) => {

        const _validLines = [] // raw line content from transcriptArrayFromSelectorQuery[i].innerText
        const _invalidLines = [] // raw line content from transcriptArrayFromSelectorQuery[i].innerText
        
        for( i in transcriptArray ) {
            const line = transcriptArray[i].innerText
            const result = lineValidationCheck(line)
            if (result.isValid) {
                _validLines.push(result.line)
                continue
            }
            else if (!result.isValid) {
                _invalidLines.push(result.line)
                continue
            }
            else {
                logger.error(`line validation got weird. how'd we even get here?`)
                continue
            }
        }
        
        logger.info(`valid line count: ${ _validLines.length }, invalid line count: ${ _invalidLines.length }`)

        const _getTranscriptText = (linesThatPassedValidation) => {
            const _linesOfTranscribedSpeech = []
            for( i in linesThatPassedValidation ) {
                const _text = linesThatPassedValidation[i].split('\n')[2]
                _linesOfTranscribedSpeech.push(_text)
            }
            return _linesOfTranscribedSpeech.join(' ')
        }

        const _transcriptText = _getTranscriptText(_validLines)
        logger.debug(_transcriptText)

        return {
            invalidLines: _invalidLines,
            validLineCount: _validLines.length,
            transcriptText: _transcriptText
        }
    }

    const transcriptionPullResult = pullTranscription(transcriptArray)

    logger.obj(transcriptionPullResult)

    return transcriptionPullResult.transcriptText

})()
