const mongoose = require('mongoose');
const Schema = require('../models/groupModel');
const Model = mongoose.model("Group");
const groupService = require('../services/groups.services')
const userService = require('../services/users.services')
const ApplicationError = require('../errors/application.errors')
const validationParams = require('../utils/validationParams')
const {errorHandler} = require('../utils/errorsHandler')

exports.createGroup = async function (req, res) {
    try {
        const name = req.body.name.trim();

        const filter = {
            name: name
        }

        const exist = await Model.findOne(filter, (error, result) => {
            return result
        })

        if (exist) {
            throw new ApplicationError("This group already exist. Please choose a different name")
        } else {
            const list = await userService.getUserList(req)

            const newObject = new Schema({
                name: name,
                user: list,
            });

            newObject.save((error, created) => {
                if (error) {
                    throw new Error(error)
                }
                if (created) return res.status(200).json(created)
            });
        }
    } catch (error) {
        errorHandler(error, res)
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const group = req.params.group_id
        const user = req.user._id

        const exist = await groupService.getGroup(group)
        const isAdmin = await groupService.isAdmin(group, user)

        if (isAdmin && exist) {
            const filter = {
                _id: group
            }

            Model.remove(filter , (error) => {
                if (error) {
                    throw new Error(error)
                } else {
                    res.status(200).json({message: "Group successfully removed"});
                }
            })
        } else if (exist) {
            throw new ApplicationError("You must be an administrator of this group to perform this operation")
        } else {
            throw new ApplicationError("This group does not exist")
        }
    } catch (error) {
        errorHandler(error, res)
    }
};

exports.getGroupById = async (req, res) => {
    try {
        const group = req.params.group_id

        if (isValid(group)) {
            const filter = {
                _id: group
            }

            const result = await Model.findById(filter, (error, result) => {
                return result
            })

            if (result) {
                res.status(200).json(result);
            } else {
                throw new ApplicationError("The group does not exist", 500)
            }
        }
    } catch (error) {
        errorHandler(error, res)
    }
};

exports.getGroupsList = async (req, res) => {
    try {
        Model.find({}, (error, result) => {
            if (error) console.log(error)
            res.status(200).json(result);
        });
    } catch (error) {
        errorHandler(error, res)
    }
};

exports.updateGroup = async (req, res) => {
    await groupService.getGroupAdmin(req.user._id, req.params.group_id).then(() => {

        const filter = {
            _id: req.params.group_id
        }
        
        const update = {
                name: req.body.name,
                user: req.body.user
        }

        Model.findOneAndUpdate(filter, update, {new: true}, (error, updated) => {
                if (error) {
                    throw new Error(error)
                }
                if (updated) {
                    res.status(200).json(updated)
                }
            });
        }
    ).catch(() => {
        res.status(403).json({message: 'You must be an administrator of this group to perform this operation'})
    })
};


exports.getGroupsByUser = (req, res) => {
    validationParams.ifValidId(req.params.user_id).then(() => {
        Model.find({
            $or: [
                {
                    'user.user_id': req.params.user_id,
                }
            ]
        }, (error, groupModel) => {
            if (error) {
                throw new Error(error)
            } else {
                res.status(200);
                res.json(groupModel);
            }
        });
    }).catch((error) => {
        console.log(error)
        res.status(500).json({message: 'The group id is not valid'})
    })
};
