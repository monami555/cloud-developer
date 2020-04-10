import {filterImageFromURL, deleteLocalFiles} from './../../util/util';
import { Router, Request, Response } from 'express';

const router: Router = Router();

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// endpoint to filter an image from a public url.
// IT SHOULD
//    1
//    1. validate the image_url query
//    2. call filterImageFromURL(image_url) to filter the image
//    3. send the resulting file in the response
//    4. deletes any files on the server on finish of the response
// QUERY PARAMATERS
//    image_url: URL of a publicly accessible image
// RETURNS
//   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
router.get('/', async (req: Request, res: Response) => {

// get the data
const { image_url } = req.query;

// validate the data
if (!image_url){
    res.status(400).send("The image_url query parameter is missing");
}
try {
    new URL(image_url);
} catch (error) {
    res.status(400).send("The value of the image_url query parameter must be a valid URL");
}

// use the data
try {
    // convert the file
    var filePath = await filterImageFromURL(image_url).catch(error => {
      throw Error(error);
    });

    // send the file
    res.status(200).sendFile(filePath, (error => {
        // delete the file
        deleteLocalFiles([filePath]);
        if (error){
            throw error;
        }
    }));

  } catch (error) {
        console.error(error);
        res.status(500).send(`Failed to fetch the image from ${image_url}. Is the image accessible publicly and in the right format?`);
  }
});

/**************************************************************************** */

//! END @TODO1

export const FilteredImageRouter: Router = router;